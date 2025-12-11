import { Browser, BrowserContext, Page, chromium } from "playwright";

export class BrowserFactory {
  private static browser: Browser | null = null;
  private static context: BrowserContext | null = null;
  private static page: Page | null = null;

  static async launch() {
    this.browser = await chromium.launch({
      headless: false,
      args: [
        "--disable-web-security",
        "--no-sandbox",
        "--disable-site-isolation-trials",
      ],
    });

    this.context = await this.browser.newContext({ ignoreHTTPSErrors: true });
    this.page = await this.context.newPage();
  }

  static async getPage(): Promise<Page> {
    if (!this.page) {
      await this.launch();
    }
    return this.page!;
  }

  static async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }

    if (this.context) {
      await this.context.close();
      this.context = null;
    }

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
