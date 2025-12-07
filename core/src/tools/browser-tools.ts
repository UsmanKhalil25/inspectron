import { BrowserService } from "../services";
import { PageElement } from "../types";

export interface BrowserTools {
  click: (elementId: number) => Promise<void>;
  type: (elementId: number, text: string) => Promise<void>;
  scroll: (direction: "up" | "down", amount?: number) => Promise<void>;
  wait: (ms?: number) => Promise<void>;
  goBack: () => Promise<void>;
}

export function createBrowserTools(
  browserService: BrowserService,
  elements: PageElement[],
): BrowserTools {
  return {
    async click(elementId: number): Promise<void> {
      const element = elements.find((el) => el.id === elementId);
      if (!element) {
        throw new Error(`Element with ID ${elementId} not found`);
      }

      const page = browserService.getPage();
      const { x, y, width, height } = element.boundingBox;

      await page.mouse.click(x + width / 2, y + height / 2);
      await browserService.wait();
    },

    async type(elementId: number, text: string): Promise<void> {
      const element = elements.find((el) => el.id === elementId);
      if (!element) {
        throw new Error(`Element with ID ${elementId} not found`);
      }

      const page = browserService.getPage();
      const { x, y, width, height } = element.boundingBox;

      await page.mouse.click(x + width / 2, y + height / 2);
      await page.keyboard.type(text);
      await browserService.wait(200);
    },

    async scroll(
      direction: "up" | "down",
      amount: number = 500,
    ): Promise<void> {
      const page = browserService.getPage();
      const delta = direction === "down" ? amount : -amount;

      await page.mouse.wheel(0, delta);
      await browserService.wait(300);
    },

    async wait(ms: number = 500): Promise<void> {
      await browserService.wait(ms);
    },

    async goBack(): Promise<void> {
      const page = browserService.getPage();
      await page.goBack();
      await browserService.wait();
    },
  };
}
