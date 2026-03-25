import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PubSub } from 'graphql-subscriptions';
import { Scan } from './scans.entity';
import { ScanAction } from './interfaces/scan-action.interface';
import { PUB_SUB, SCAN_EVENTS } from './scans.constants';

export interface BrowserAgentRunResponse {
  run_id: string;
}

export interface BrowserAgentStepEvent {
  type: 'step';
  step: number;
  timestamp: number;
  thinking: string | null;
  action: {
    name: string;
    params: Record<string, any>;
    display: string;
  };
  context: {
    url: string;
    title: string;
  };
}

export interface BrowserAgentDoneEvent {
  type: 'done';
  result: string;
  timestamp: number;
}

export interface BrowserAgentErrorEvent {
  type: 'error';
  message: string;
  timestamp: number;
}

export type BrowserAgentEvent =
  | BrowserAgentStepEvent
  | BrowserAgentDoneEvent
  | BrowserAgentErrorEvent;

@Injectable()
export class BrowserAgentService {
  private readonly logger = new Logger(BrowserAgentService.name);
  private readonly baseUrl: string;

  constructor(
    private configService: ConfigService,
    @Inject(PUB_SUB)
    private readonly pubSub: PubSub,
  ) {
    this.baseUrl =
      this.configService.get<string>('browserAgent.apiUrl') ||
      'http://localhost:8000';
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
      throw new Error(
        `Failed to create browser-agent run: ${response.status} ${errorText}`,
      );
    }

    const data = (await response.json()) as BrowserAgentRunResponse;
    this.logger.log(`Created browser-agent run: ${data.run_id}`);
    return data.run_id;
  }

  async streamEvents(
    scan: Scan,
    runId: string,
    onStepEvent?: (action: ScanAction) => Promise<void>,
  ): Promise<void> {
    this.logger.log(
      `Streaming browser-agent events for scan ${scan.id}, run ${runId}`,
    );

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
              await this.handleEvent(scan, event, onStepEvent);
            } catch {
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

  private async handleEvent(
    scan: Scan,
    event: BrowserAgentEvent,
    onStepEvent?: (action: ScanAction) => Promise<void>,
  ): Promise<void> {
    this.logger.debug(`Received event: ${JSON.stringify(event)}`);

    if (event.type === 'step') {
      const action: ScanAction = {
        step: event.step,
        timestamp: new Date(event.timestamp * 1000).toISOString(),
        thinking: event.thinking,
        action: {
          name: event.action.name,
          params: JSON.stringify(event.action.params),
          display: event.action.display,
        },
        context: event.context,
      };

      if (onStepEvent) {
        await onStepEvent(action);
      }

      await this.pubSub.publish(SCAN_EVENTS, {
        scanEvents: {
          scanId: scan.id,
          type: 'step',
          data: action,
        },
      });
    } else if (event.type === 'done') {
      await this.pubSub.publish(SCAN_EVENTS, {
        scanEvents: {
          scanId: scan.id,
          type: 'completed',
          result: event.result,
          timestamp: new Date(event.timestamp * 1000).toISOString(),
        },
      });
    } else if (event.type === 'error') {
      await this.pubSub.publish(SCAN_EVENTS, {
        scanEvents: {
          scanId: scan.id,
          type: 'error',
          message: event.message,
          timestamp: new Date(event.timestamp * 1000).toISOString(),
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
      const data = (await response.json()) as { screenshot: string };
      return data.screenshot;
    } catch (error) {
      this.logger.warn(`Error getting screenshot:`, error);
      return null;
    }
  }
}
