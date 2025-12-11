import type { Page } from "playwright";

import type { PageElement } from "../schemas/page-elements.js";

import { AgentStateType } from "./state.js";
import { labelElements } from "../utils/label-elements.js";
import { LlmFactory } from "./factory";

export async function getInteractiveElements(page: Page): Promise<PageElement[]> {
  return page.evaluate(() => {
    const selectors = [
      "input",
      "textarea",
      "button",
      "[role=button]",
      "[onclick]",
      "a[href]",
      "select",
      "iframe",
      "video",
    ];

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
  });
}


export async function labelElementsNode(state: AgentStateType) {
  const page = state.page;
  const interactiveElements = await getInteractiveElements(page);
  await labelElements(page, interactiveElements);
  state.interactiveElements= interactiveElements;
}

export async function captureScreenshotNode(state: AgentStateType) {
  const page = state.page;
  return await page.screenshot({ fullPage: true });
}

export async function llmCall(state: AgentStateType) {
  const model = LlmFactory.getLLM();

}


export async function shouldContinue(state: AgentStateType) {
  // TODO: implement a better logic to decide whether to continue or not

}
