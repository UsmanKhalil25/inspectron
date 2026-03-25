import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as WebSocket from 'ws';
import type { PubSubEngine } from 'graphql-subscriptions';
import { BROWSER_PREVIEW_STREAM } from './scans.constants';

export interface BrowserPreviewFrame {
  type: 'frame';
  data: string;
  timestamp: number;
  frame_number: number;
  latency_ms: number;
}

export interface BrowserPreviewError {
  type: 'error';
  message: string;
}

export type BrowserPreviewMessage = BrowserPreviewFrame | BrowserPreviewError;

@Injectable()
export class BrowserPreviewStreamService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(BrowserPreviewStreamService.name);
  private readonly baseUrl: string;
  private activeConnections: Map<string, WebSocket> = new Map();

  constructor(private configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('browserAgent.apiUrl') ||
      'http://localhost:8000';
  }

  private getWsUrl(runId: string): string {
    const wsUrl = this.baseUrl
      .replace('http://', 'ws://')
      .replace('https://', 'wss://');
    return `${wsUrl}/runs/${runId}/stream/frames`;
  }

  startStream(runId: string, pubSub: PubSubEngine): void {
    if (this.activeConnections.has(runId)) {
      this.logger.warn(`Stream already active for run ${runId}`);
      return;
    }

    const wsUrl = this.getWsUrl(runId);
    this.logger.log(
      `Starting browser preview stream for run ${runId}: ${wsUrl}`,
    );

    const ws = new WebSocket(wsUrl);

    ws.on('open', () => {
      this.logger.debug(`WebSocket connected for run ${runId}`);
    });

    ws.on('message', (rawData: WebSocket.RawData) => {
      try {
        let messageText: string;
        if (Buffer.isBuffer(rawData)) {
          messageText = rawData.toString('utf-8');
        } else if (typeof rawData === 'string') {
          messageText = rawData;
        } else if (rawData instanceof ArrayBuffer) {
          messageText = Buffer.from(rawData).toString('utf-8');
        } else {
          messageText = String(rawData);
        }
        const message = JSON.parse(messageText) as BrowserPreviewMessage;

        if (message.type === 'frame') {
          void pubSub.publish(BROWSER_PREVIEW_STREAM, {
            browserPreviewStream: {
              runId,
              frame: message.data,
              timestamp: message.timestamp,
              frameNumber: message.frame_number,
              latencyMs: message.latency_ms,
            },
          });
        } else if (message.type === 'error') {
          this.logger.error(
            `Browser preview stream error for run ${runId}: ${message.message}`,
          );
        }
      } catch (error) {
        this.logger.warn(`Failed to parse WebSocket message: ${String(error)}`);
      }
    });

    ws.on('close', (code: number, reason: Buffer) => {
      this.logger.debug(
        `WebSocket closed for run ${runId}: ${code} ${reason.toString()}`,
      );
      this.activeConnections.delete(runId);
    });

    ws.on('error', (error: Error) => {
      this.logger.error(`WebSocket error for run ${runId}: ${error.message}`);
      this.activeConnections.delete(runId);
    });

    this.activeConnections.set(runId, ws);
  }

  stopStream(runId: string): void {
    const ws = this.activeConnections.get(runId);
    if (ws) {
      this.logger.log(`Stopping browser preview stream for run ${runId}`);
      ws.close();
      this.activeConnections.delete(runId);
    }
  }

  isStreaming(runId: string): boolean {
    return this.activeConnections.has(runId);
  }

  onModuleInit() {
    this.logger.log('BrowserPreviewStreamService initialized');
  }

  onModuleDestroy() {
    for (const [runId, ws] of this.activeConnections) {
      this.logger.debug(`Closing stream for run ${runId}`);
      ws.close();
    }
    this.activeConnections.clear();
  }
}
