import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PubSub } from 'graphql-subscriptions';
import { Scan } from './scans.entity';
import { PUB_SUB, SCAN_EVENTS } from './scans.constants';

export interface BrowserAgentRunResponse {
	run_id: string;
}

export interface BrowserAgentStepEvent {
	type: 'step';
	step: number;
	action: string;
	goal: string;
	url: string;
}

export interface BrowserAgentDoneEvent {
	type: 'done';
	result: string;
}

export interface BrowserAgentErrorEvent {
	type: 'error';
	message: string;
}

export type BrowserAgentEvent = BrowserAgentStepEvent | BrowserAgentDoneEvent | BrowserAgentErrorEvent;

@Injectable()
export class BrowserAgentService {
	private readonly logger = new Logger(BrowserAgentService.name);
	private readonly baseUrl: string;

	constructor(
		private configService: ConfigService,
		@Inject(PUB_SUB)
		private readonly pubSub: PubSub,
	) {
		this.baseUrl = this.configService.get<string>('browserAgent.apiUrl') || 'http://localhost:8000';
	}

	async createRun(url: string, task: string): Promise<string> {
		this.logger.log(`Creating browser-agent run for URL: ${url}`);

		const response = await fetch(`${this.baseUrl}/runs`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ url, task }),
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Failed to create browser-agent run: ${response.status} ${errorText}`);
		}

		const data = (await response.json()) as BrowserAgentRunResponse;
		this.logger.log(`Created browser-agent run: ${data.run_id}`);
		return data.run_id;
	}

	async streamEvents(scan: Scan, runId: string): Promise<void> {
		this.logger.log(`Streaming browser-agent events for scan ${scan.id}, run ${runId}`);

		try {
			const response = await fetch(`${this.baseUrl}/runs/${runId}/events`, {
				headers: {
					Accept: 'text/event-stream',
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to stream events: ${response.status}`);
			}

			const reader = response.body?.getReader();
			if (!reader) {
				throw new Error('Failed to get response reader');
			}

			const decoder = new TextDecoder();
			let buffer = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split('\n');
				buffer = lines.pop() || '';

				for (const line of lines) {
					if (line.startsWith('data: ')) {
						const eventData = line.slice(6);
						try {
							const event = JSON.parse(eventData) as BrowserAgentEvent;
							await this.handleEvent(scan, event);
						} catch (parseError) {
							this.logger.warn(`Failed to parse event: ${eventData}`);
						}
					}
				}
			}
		} catch (error) {
			this.logger.error(`Error streaming browser-agent events:`, error);
			throw error;
		}
	}

	private async handleEvent(scan: Scan, event: BrowserAgentEvent): Promise<void> {
		this.logger.debug(`Received event: ${JSON.stringify(event)}`);

		if (event.type === 'step') {
			await this.pubSub.publish(SCAN_EVENTS, {
				scanEvents: {
					scanId: scan.id,
					type: 'step',
					data: {
						step: event.step,
						action: event.action,
						goal: event.goal,
						url: event.url,
					},
				},
			});
		} else if (event.type === 'done') {
			await this.pubSub.publish(SCAN_EVENTS, {
				scanEvents: {
					scanId: scan.id,
					type: 'completed',
					data: {
						result: event.result,
					},
				},
			});
		} else if (event.type === 'error') {
			await this.pubSub.publish(SCAN_EVENTS, {
				scanEvents: {
					scanId: scan.id,
					type: 'error',
					data: {
						message: event.message,
					},
				},
			});
		}
	}

	async getScreenshot(runId: string): Promise<string | null> {
		try {
			const response = await fetch(`${this.baseUrl}/runs/${runId}/screenshot`);
			if (response.status === 204) {
				return null;
			}
			if (!response.ok) {
				this.logger.warn(`Failed to get screenshot: ${response.status}`);
				return null;
			}
			const data = await response.json() as { screenshot: string };
			return data.screenshot;
		} catch (error) {
			this.logger.warn(`Error getting screenshot:`, error);
			return null;
		}
	}
}