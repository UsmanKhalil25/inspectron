import type { Page, ElementHandle } from "playwright";

export class Scraper {
  static async findLinks(page: Page): Promise<ElementHandle<HTMLElement>[]> {
    return page.$$("a");
  }
}
