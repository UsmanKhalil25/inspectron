import { Browser, BrowserContext, Page, chromium } from "playwright";

export class BrowserFactory {
  private static browser: Browser | null = null;
  private static context: BrowserContext | null = null;
  private static page: Page | null = null;

  static async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: false });
    }
    return this.browser;
  }

  static async getContext(): Promise<BrowserContext> {
    if (!this.context) {
      const browser = await this.getBrowser();
      this.context = await browser.newContext();
    }
    return this.context;
  }

  static async getPage(): Promise<Page> {
    if (!this.page) {
      const context = await this.getContext();
      this.page = await context.newPage();
    }
    return this.page;
  }

  static async reset(): Promise<void> {
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
