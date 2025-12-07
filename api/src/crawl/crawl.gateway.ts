import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { CrawlManager, CrawlManagerEvent } from "core/dist/crawler";
import {
  WSMessageType,
  type CrawlStartedMessage,
  type CrawlStoppedMessage,
  type CrawlCompletedMessage,
  type CrawlErrorMessage,
  type UrlDiscoveredMessage,
  type UrlQueuedMessage,
  type UrlVisitingMessage,
  type UrlVisitedMessage,
  type UrlFailedMessage,
  type CrawlProgressMessage,
  type ScreencastFrameMessage,
} from "shared";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
  namespace: "/crawl",
})
export class CrawlGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CrawlGateway.name);
  private activeClients = new Set<string>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.activeClients.add(client.id);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.activeClients.delete(client.id);
  }

  handleCrawlManagerEvent(event: CrawlManagerEvent, sessionId: string): void {
    if (event.type === "screencast_frame") {
      const message: ScreencastFrameMessage = {
        type: WSMessageType.SCREENCAST_FRAME,
        payload: {
          data: event.frame.data,
          metadata: event.frame.metadata,
        },
      };
      this.server.emit(WSMessageType.SCREENCAST_FRAME, message);
    } else if (event.type === "crawl_event") {
      const crawlEvent = event.event;

      switch (crawlEvent.type) {
        case "url_discovered": {
          const message: UrlDiscoveredMessage = {
            type: WSMessageType.URL_DISCOVERED,
            payload: {
              url: crawlEvent.url,
              timestamp: Date.now(),
              sessionId,
            },
          };
          this.server.emit(WSMessageType.URL_DISCOVERED, message);
          break;
        }
        case "url_queued": {
          const message: UrlQueuedMessage = {
            type: WSMessageType.URL_QUEUED,
            payload: {
              url: crawlEvent.url,
              timestamp: Date.now(),
              sessionId,
            },
          };
          this.server.emit(WSMessageType.URL_QUEUED, message);
          break;
        }
        case "url_visiting": {
          const message: UrlVisitingMessage = {
            type: WSMessageType.URL_VISITING,
            payload: {
              url: crawlEvent.url,
              timestamp: Date.now(),
              sessionId,
            },
          };
          this.server.emit(WSMessageType.URL_VISITING, message);
          break;
        }
        case "url_visited": {
          const message: UrlVisitedMessage = {
            type: WSMessageType.URL_VISITED,
            payload: {
              url: crawlEvent.url,
              timestamp: Date.now(),
              sessionId,
              statusCode: crawlEvent.statusCode,
            },
          };
          this.server.emit(WSMessageType.URL_VISITED, message);
          break;
        }
        case "url_failed": {
          const message: UrlFailedMessage = {
            type: WSMessageType.URL_FAILED,
            payload: {
              url: crawlEvent.url,
              timestamp: Date.now(),
              sessionId,
              error: crawlEvent.error,
              statusCode: crawlEvent.statusCode,
            },
          };
          this.server.emit(WSMessageType.URL_FAILED, message);
          break;
        }
        case "progress": {
          const message: CrawlProgressMessage = {
            type: WSMessageType.CRAWL_PROGRESS,
            payload: {
              timestamp: Date.now(),
              sessionId,
              totalDiscovered: crawlEvent.stats.totalDiscovered,
              visitedCount: crawlEvent.stats.visitedCount,
              queueDepth: crawlEvent.stats.queueDepth,
              failedCount: crawlEvent.stats.failedCount,
              crawlRate: crawlEvent.stats.crawlRate,
            },
          };
          this.server.emit(WSMessageType.CRAWL_PROGRESS, message);
          break;
        }
      }
    }
  }

  emitCrawlStarted(baseUrl: string, sessionId: string): void {
    const message: CrawlStartedMessage = {
      type: WSMessageType.CRAWL_STARTED,
      payload: {
        baseUrl,
        timestamp: Date.now(),
        sessionId,
      },
    };
    this.server.emit(WSMessageType.CRAWL_STARTED, message);
  }

  emitCrawlStopped(
    sessionId: string,
    reason: "user_requested" | "error" | "completed",
  ): void {
    const message: CrawlStoppedMessage = {
      type: WSMessageType.CRAWL_STOPPED,
      payload: {
        timestamp: Date.now(),
        sessionId,
        reason,
      },
    };
    this.server.emit(WSMessageType.CRAWL_STOPPED, message);
  }

  emitCrawlCompleted(crawlManager: CrawlManager): void {
    const stats = crawlManager.getStats();
    const message: CrawlCompletedMessage = {
      type: WSMessageType.CRAWL_COMPLETED,
      payload: {
        timestamp: Date.now(),
        sessionId: crawlManager.sessionId,
        totalUrls: stats?.totalDiscovered || 0,
        visitedCount: stats?.visitedCount || 0,
        failedCount: stats?.failedCount || 0,
      },
    };
    this.server.emit(WSMessageType.CRAWL_COMPLETED, message);
  }

  emitCrawlError(error: string, sessionId: string): void {
    const message: CrawlErrorMessage = {
      type: WSMessageType.CRAWL_ERROR,
      payload: {
        error,
        timestamp: Date.now(),
        sessionId,
      },
    };
    this.server.emit(WSMessageType.CRAWL_ERROR, message);
  }
}
