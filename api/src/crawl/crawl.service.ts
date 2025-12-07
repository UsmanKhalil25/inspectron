import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { CrawlManager } from "core/dist/crawler";
import type {
  StartCrawlRequest,
  StartCrawlResponse,
  StopCrawlResponse,
} from "shared";
import { CrawlGateway } from "./crawl.gateway";

@Injectable()
export class CrawlService {
  private readonly logger = new Logger(CrawlService.name);
  private activeCrawlManager: CrawlManager | null = null;

  constructor(private readonly crawlGateway: CrawlGateway) {}

  async startCrawl(request: StartCrawlRequest): Promise<StartCrawlResponse> {
    if (this.activeCrawlManager) {
      this.logger.log(
        "Stopping existing crawl session before starting new one",
      );
      await this.stopExistingCrawl();
    }

    const crawlManager = new CrawlManager({
      baseUrl: request.url,
      headless: false,
      screencastOptions: request.screencastOptions || {
        quality: 60,
        maxWidth: 1280,
        maxHeight: 720,
      },
      maxDepth: request.crawlOptions?.maxDepth,
      maxPages: request.crawlOptions?.maxPages,
    });

    crawlManager.onEvent((event) => {
      this.crawlGateway.handleCrawlManagerEvent(event, crawlManager.sessionId);
    });

    this.activeCrawlManager = crawlManager;

    this.crawlGateway.emitCrawlStarted(request.url, crawlManager.sessionId);

    crawlManager
      .start()
      .then(() => {
        this.logger.log("Crawl completed");
        this.crawlGateway.emitCrawlCompleted(crawlManager);
        this.activeCrawlManager = null;
      })
      .catch((error) => {
        this.logger.error("Crawl error:", error);
        this.crawlGateway.emitCrawlError(
          error.message || "Crawl failed",
          crawlManager.sessionId,
        );
        this.activeCrawlManager = null;
      });

    return {
      sessionId: crawlManager.sessionId,
      message: "Crawl started successfully",
      timestamp: Date.now(),
    };
  }

  async stopCrawl(): Promise<StopCrawlResponse> {
    if (!this.activeCrawlManager) {
      throw new BadRequestException("No active crawl session");
    }

    await this.stopExistingCrawl();

    return {
      message: "Crawl stopped successfully",
      timestamp: Date.now(),
    };
  }

  private async stopExistingCrawl(): Promise<void> {
    if (this.activeCrawlManager) {
      const sessionId = this.activeCrawlManager.sessionId;
      await this.activeCrawlManager.stop();
      this.crawlGateway.emitCrawlStopped(sessionId, "user_requested");
      this.activeCrawlManager = null;
    }
  }

  getActiveCrawlManager(): CrawlManager | null {
    return this.activeCrawlManager;
  }
}
