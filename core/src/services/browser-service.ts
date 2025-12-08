import { Browser, BrowserContext, Page, chromium } from "playwright";

import { PageElement } from "../types";

export class BrowserService {
  private browser!: Browser;
  private context!: BrowserContext;
  private page!: Page;

  private async getElementsBySelectors(
    selectors: string[],
  ): Promise<PageElement[]> {
    const page = this.getPage();

    return page.evaluate((selectors) => {
      const elements = document.querySelectorAll(selectors.join(","));
      const result: PageElement[] = [];

      elements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          result.push({
            id: index + 1,
            tag: el.tagName.toLowerCase(),
            text: (el as HTMLElement).innerText?.trim() || null,
            boundingBox: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
            },
          });
        }
      });

      return result;
    }, selectors);
  }

  getPage(): Page {
    if (!this.page) {
      throw new Error("Browser not launched. Call launch() first.");
    }
    return this.page;
  }

  async launch() {
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

  async navigate(url: string) {
    const page = this.getPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await this.wait();
  }

  async wait(timeoutMs = 500) {
    const page = this.getPage();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(timeoutMs);
  }

  async screenshot(): Promise<Buffer> {
    const page = this.getPage();
    return page.screenshot({ fullPage: true });
  }

  async getButtons(): Promise<PageElement[]> {
    return this.getElementsBySelectors([
      "button",
      "[role=button]",
      "[onclick]",
    ]);
  }

  async getLinks(): Promise<PageElement[]> {
    return this.getElementsBySelectors(["a[href]"]);
  }

  async close() {
    await this.page?.close();
    await this.context?.close();
    await this.browser?.close();
  }
}
