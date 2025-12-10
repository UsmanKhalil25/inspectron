import { Browser, BrowserContext, Page, chromium } from "playwright";

import { PageElement } from "../types";

export class BrowserService {
  private browser!: Browser;
  private context!: BrowserContext;
  private page!: Page;

  get currentPage(): Page {
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

  async close() {
    await this.page?.close();
    await this.context?.close();
    await this.browser?.close();
  }

  async screenshot(): Promise<Buffer> {
    return this.currentPage.screenshot({ fullPage: true });
  }

  private async getElementsBySelectors(
    selectors: string[],
  ): Promise<PageElement[]> {
    return this.currentPage.evaluate((selectors) => {
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

  async getInputs(): Promise<PageElement[]> {
    return this.getElementsBySelectors(["input"]);
  }

  async getTextareas(): Promise<PageElement[]> {
    return this.getElementsBySelectors(["textarea"]);
  }

  async getSelects(): Promise<PageElement[]> {
    return this.getElementsBySelectors(["select"]);
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

  async getIframes(): Promise<PageElement[]> {
    return this.getElementsBySelectors(["iframe"]);
  }

  async getVideos(): Promise<PageElement[]> {
    return this.getElementsBySelectors(["video"]);
  }

  async navigate(url: string) {
    await this.currentPage.goto(url, { waitUntil: "domcontentloaded" });
    await this.wait();
  }

  async wait(timeoutMs = 500) {
    await this.currentPage.waitForLoadState("networkidle");
    await this.currentPage.waitForTimeout(timeoutMs);
  }

  async scroll(amount: number): Promise<void> {
    await this.currentPage.evaluate(
      (amount) => window.scrollBy(0, amount),
      amount,
    );
    await this.wait(200);
  }

  async clickElement(element: PageElement): Promise<void> {
    const { x, y, width, height } = element.boundingBox;
    await this.currentPage.mouse.click(x + width / 2, y + height / 2);
    await this.wait(300);
  }

  async typeIntoElement(element: PageElement, text: string): Promise<void> {
    const { x, y, width, height } = element.boundingBox;
    await this.currentPage.mouse.click(x + width / 2, y + height / 2);
    await this.wait(150);
    await this.currentPage.keyboard.type(text);
    await this.wait(200);
  }
}
