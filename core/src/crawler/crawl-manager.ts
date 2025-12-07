import { chromium, Browser, BrowserContext, Page } from "playwright";
import { CrawlEngine, CrawlEvent, CrawlStats } from "./crawl-engine";
import {
  ScreencastManager,
  ScreencastOptions,
  ScreencastFrameData,
} from "./screencast-manager";
import { v4 as uuidv4 } from "uuid";

const CDP_ENDPOINT = "http://localhost:9222";

export type CrawlManagerConfig = {
  baseUrl: string;
  headless?: boolean;
  screencastOptions?: ScreencastOptions;
  maxDepth?: number;
  maxPages?: number;
};

export type CrawlManagerEvent =
  | { type: "screencast_frame"; frame: ScreencastFrameData }
  | { type: "crawl_event"; event: CrawlEvent };

export type CrawlManagerEventHandler = (event: CrawlManagerEvent) => void;

export class CrawlManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private crawlEngine: CrawlEngine | null = null;
  private screencastManager: ScreencastManager | null = null;
  private eventHandler: CrawlManagerEventHandler | null = null;
  private isRunning = false;
  public readonly sessionId: string;
  private screencastReadyPromise: Promise<void>;
  private screencastReadyResolve!: () => void;
  private firstFrameReceived = false;

  constructor(private readonly config: CrawlManagerConfig) {
    this.sessionId = uuidv4();
    this.screencastReadyPromise = new Promise<void>((resolve) => {
      this.screencastReadyResolve = resolve;
    });
  }

  onEvent(handler: CrawlManagerEventHandler): void {
    this.eventHandler = handler;
  }

  private emit(event: CrawlManagerEvent): void {
    if (this.eventHandler) {
      this.eventHandler(event);
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error("Crawl already running");
    }

    this.browser = await chromium.launch({
      headless: this.config.headless !== false,
      args: ["--remote-debugging-port=9222"],
    });

    const cdpBrowser = await chromium.connectOverCDP(CDP_ENDPOINT);
    this.context = cdpBrowser.contexts()[0];
    this.page = this.context.pages()[0] || (await this.context.newPage());

    await this.page.goto(this.config.baseUrl);

    this.screencastManager = new ScreencastManager({
      externalPage: this.page,
    });

    await this.screencastManager.startScreencast(
      this.config.screencastOptions || {
        format: "jpeg",
        quality: 60,
        maxWidth: 1280,
        maxHeight: 720,
      },
      (frame) => {
        this.emit({ type: "screencast_frame", frame });

        if (!this.firstFrameReceived) {
          this.firstFrameReceived = true;
          this.screencastReadyResolve();
        }
      },
    );

    console.log("Waiting for screencast to be ready...");
    await this.screencastReadyPromise;
    console.log("Screencast ready, starting crawl");

    this.crawlEngine = new CrawlEngine(this.config.baseUrl, {
      externalPage: this.page,
      maxDepth: this.config.maxDepth,
      maxPages: this.config.maxPages,
    });

    this.crawlEngine.onEvent((event) => {
      this.emit({ type: "crawl_event", event });
    });

    this.isRunning = true;

    await this.crawlEngine.run();

    this.isRunning = false;
  }

  async stop(): Promise<void> {
    if (this.crawlEngine) {
      await this.crawlEngine.stop();
    }

    if (this.screencastManager) {
      await this.screencastManager.close();
      this.screencastManager = null;
    }

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
    }

    this.isRunning = false;
  }

  getStats(): CrawlStats | null {
    return this.crawlEngine ? this.crawlEngine.getStats() : null;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  isActive(): boolean {
    return this.isRunning;
  }
}
