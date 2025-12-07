import {
  chromium,
  Browser,
  BrowserContext,
  Page,
  CDPSession,
} from "playwright";

const CDP_ENDPOINT = "http://localhost:9222";

export type ScreencastOptions = {
  format?: "jpeg" | "png";
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
};

export type ScreencastFrameData = {
  data: string;
  metadata: {
    timestamp: number;
    offsetTop?: number;
    pageScaleFactor?: number;
    deviceWidth?: number;
    deviceHeight?: number;
    scrollOffsetX?: number;
    scrollOffsetY?: number;
  };
  sessionId: number;
};

export type ScreencastFrameHandler = (frame: ScreencastFrameData) => void;

export type ScreencastManagerConfig = {
  externalPage?: Page;
};

export class ScreencastManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private cdpSession: CDPSession | null = null;
  private frameHandler: ScreencastFrameHandler | null = null;
  private isScreencasting = false;
  private readonly usingExternalPage: boolean;

  constructor(config: ScreencastManagerConfig = {}) {
    if (config.externalPage) {
      this.page = config.externalPage;
      this.usingExternalPage = true;
    } else {
      this.usingExternalPage = false;
    }
  }

  async launch(headless: boolean = false): Promise<void> {
    if (this.usingExternalPage) {
      return;
    }

    this.browser = await chromium.launch({
      headless,
      args: ["--remote-debugging-port=9222"],
    });

    const cdpBrowser = await chromium.connectOverCDP(CDP_ENDPOINT);
    this.context = cdpBrowser.contexts()[0];
    this.page = this.context.pages()[0] || (await this.context.newPage());
  }

  async goto(url: string): Promise<void> {
    if (!this.page) {
      throw new Error("Browser not initialized. Call launch() first.");
    }
    if (!this.usingExternalPage) {
      await this.page.goto(url);
    }
  }

  async startScreencast(
    options: ScreencastOptions,
    onFrame: ScreencastFrameHandler,
  ): Promise<void> {
    if (!this.page) {
      throw new Error("Browser not initialized. Call launch() first.");
    }

    if (this.isScreencasting) {
      throw new Error("Screencast already running");
    }

    this.frameHandler = onFrame;

    this.cdpSession = await this.page.context().newCDPSession(this.page);
    await this.cdpSession.send("Page.enable");

    await this.cdpSession.send("Page.startScreencast", {
      format: options.format || "jpeg",
      quality: options.quality || 60,
      maxWidth: options.maxWidth || 1280,
      maxHeight: options.maxHeight || 720,
    });

    this.isScreencasting = true;
    this.cdpSession.on("Page.screencastFrame", async (frame: any) => {
      if (this.frameHandler) {
        this.frameHandler({
          data: frame.data,
          metadata: {
            timestamp: frame.metadata.timestamp || Date.now(),
            offsetTop: frame.metadata.offsetTop,
            pageScaleFactor: frame.metadata.pageScaleFactor,
            deviceWidth: frame.metadata.deviceWidth,
            deviceHeight: frame.metadata.deviceHeight,
            scrollOffsetX: frame.metadata.scrollOffsetX,
            scrollOffsetY: frame.metadata.scrollOffsetY,
          },
          sessionId: frame.sessionId,
        });
      }

      if (this.cdpSession) {
        await this.cdpSession.send("Page.screencastFrameAck", {
          sessionId: frame.sessionId,
        });
      }
    });
  }

  async stopScreencast(): Promise<void> {
    if (!this.isScreencasting || !this.cdpSession) {
      return;
    }

    try {
      await this.cdpSession.send("Page.stopScreencast");
      this.isScreencasting = false;
      this.frameHandler = null;
    } catch (error) {
      console.error("Error stopping screencast:", error);
    }
  }

  getPage(): Page | null {
    return this.page;
  }

  isActive(): boolean {
    return this.isScreencasting;
  }

  async close(): Promise<void> {
    if (this.isScreencasting) {
      await this.stopScreencast();
    }

    if (this.cdpSession) {
      await this.cdpSession.detach();
      this.cdpSession = null;
    }

    if (!this.usingExternalPage && this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
    }
  }
}
