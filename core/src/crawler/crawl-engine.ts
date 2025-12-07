import { StateManager } from "./state-manager";
import { PageLoader } from "./page-loader";
import { Scraper } from "./scraper";
import type { Page } from "playwright";

import { parseAndNormalize } from "../utils/url";

export type CrawlEvent =
  | { type: "url_discovered"; url: string }
  | { type: "url_queued"; url: string }
  | { type: "url_visiting"; url: string }
  | { type: "url_visited"; url: string; statusCode?: number }
  | { type: "url_failed"; url: string; error: string; statusCode?: number }
  | { type: "progress"; stats: CrawlStats };

export type CrawlStats = {
  totalDiscovered: number;
  visitedCount: number;
  queueDepth: number;
  failedCount: number;
  crawlRate: number;
};

export type CrawlConfig = {
  headless?: boolean;
  maxDepth?: number;
  maxPages?: number;
  externalPage?: Page;
};

export type CrawlEventHandler = (event: CrawlEvent) => void;

export class CrawlEngine {
  private readonly stateManager = new StateManager();
  private readonly pageLoader: PageLoader | null;
  private readonly externalPage: Page | null;
  private readonly baseHostname: string;
  private readonly maxPages?: number;
  private eventHandler: CrawlEventHandler | null = null;
  private visitedCount = 0;
  private failedCount = 0;
  private startTime = 0;
  private isRunning = false;

  constructor(
    private readonly baseUrl: string,
    { headless = true, maxDepth, maxPages, externalPage }: CrawlConfig = {},
  ) {
    if (externalPage) {
      this.externalPage = externalPage;
      this.pageLoader = null;
    } else {
      this.pageLoader = new PageLoader(headless);
      this.externalPage = null;
    }
    this.baseHostname = new URL(baseUrl).hostname.toLowerCase();
    this.maxPages = maxPages;
  }

  onEvent(handler: CrawlEventHandler): void {
    this.eventHandler = handler;
  }

  private emit(event: CrawlEvent): void {
    if (this.eventHandler) {
      this.eventHandler(event);
    }
  }

  private emitProgress(): void {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const crawlRate = elapsed > 0 ? this.visitedCount / elapsed : 0;

    this.emit({
      type: "progress",
      stats: {
        totalDiscovered: this.stateManager.getTotalDiscovered(),
        visitedCount: this.visitedCount,
        queueDepth: this.stateManager.getQueueDepth(),
        failedCount: this.failedCount,
        crawlRate: parseFloat(crawlRate.toFixed(2)),
      },
    });
  }

  async run(): Promise<void> {
    if (this.isRunning) {
      throw new Error("Crawl already running");
    }

    this.isRunning = true;
    this.startTime = Date.now();

    if (this.pageLoader && !this.externalPage) {
      await this.pageLoader.start();
    }

    const normalizedBaseUrl = parseAndNormalize(this.baseUrl);
    this.stateManager.addUrl(normalizedBaseUrl);
    this.emit({ type: "url_discovered", url: normalizedBaseUrl });
    this.emit({ type: "url_queued", url: normalizedBaseUrl });
    this.emitProgress();

    while (!this.stateManager.isEmpty() && this.isRunning) {
      if (this.maxPages && this.visitedCount >= this.maxPages) {
        break;
      }

      const url = this.stateManager.getNextUrl();
      if (!url) break;

      this.emit({ type: "url_visiting", url });

      try {
        const page = this.externalPage
          ? await this.loadWithExternalPage(url)
          : await this.pageLoader!.load(url);

        this.stateManager.markVisited(parseAndNormalize(url));
        this.visitedCount++;

        this.emit({ type: "url_visited", url, statusCode: 200 });

        const linkElements = await Scraper.findLinks(page);

        for (const el of linkElements) {
          const hrefHandle = await el.getAttribute("href");
          if (!hrefHandle) continue;

          const absoluteUrl = new URL(hrefHandle, url).toString();

          if (
            new URL(absoluteUrl).hostname.toLowerCase() !== this.baseHostname
          ) {
            continue;
          }

          const normalizedUrl = parseAndNormalize(absoluteUrl);
          const isNew = this.stateManager.addUrl(normalizedUrl);

          if (isNew) {
            this.emit({ type: "url_discovered", url: normalizedUrl });
            this.emit({ type: "url_queued", url: normalizedUrl });
          }
        }

        this.emitProgress();
      } catch (err) {
        this.failedCount++;
        const errorMessage = err instanceof Error ? err.message : String(err);
        this.emit({
          type: "url_failed",
          url,
          error: errorMessage,
          statusCode: undefined,
        });
        this.emitProgress();
      }
    }

    if (this.pageLoader && !this.externalPage) {
      await this.pageLoader.close();
    }

    this.isRunning = false;
  }

  private async loadWithExternalPage(url: string): Promise<Page> {
    if (!this.externalPage) {
      throw new Error("External page not available");
    }
    await this.externalPage.goto(url);
    return this.externalPage;
  }

  async stop(): Promise<void> {
    this.isRunning = false;
  }

  getStats(): CrawlStats {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const crawlRate = elapsed > 0 ? this.visitedCount / elapsed : 0;

    return {
      totalDiscovered: this.stateManager.getTotalDiscovered(),
      visitedCount: this.visitedCount,
      queueDepth: this.stateManager.getQueueDepth(),
      failedCount: this.failedCount,
      crawlRate: parseFloat(crawlRate.toFixed(2)),
    };
  }
}
