import { Page } from "playwright";

import { PageElement } from "../../../../libs/schemas";
import type { AnnotationHandlerType } from "../state";

async function getInteractiveElements(page: Page): Promise<PageElement[]> {
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
      const htmlEl = el as HTMLElement;

      const style = window.getComputedStyle(htmlEl);
      const isVisible =
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.opacity !== "0" &&
        htmlEl.offsetParent !== null;

      if (isVisible) {
        result.push({
          id: index + 1,
          tag: el.tagName.toLowerCase(),
          text: htmlEl.innerText?.trim() || null,
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

async function labelElements(page: Page, elements: PageElement[]) {
  await page.evaluate((items) => {
    const existingLabels = document.querySelectorAll("[data-playwright-label]");
    existingLabels.forEach((el) => el.remove());

    for (let i = 0; i < items.length; i++) {
      const el = items[i];

      const letters = "0123456789ABCDEF";
      let borderColor = "#";
      for (let j = 0; j < 6; j++) {
        borderColor += letters[Math.floor(Math.random() * 16)];
      }

      const overlay = document.createElement("div");
      overlay.setAttribute("data-playwright-label", "true");
      overlay.style.position = "fixed";
      overlay.style.left = `${el.boundingBox.x}px`;
      overlay.style.top = `${el.boundingBox.y}px`;
      overlay.style.width = `${el.boundingBox.width}px`;
      overlay.style.height = `${el.boundingBox.height}px`;
      overlay.style.border = `2px dashed ${borderColor}`;
      overlay.style.pointerEvents = "none";
      overlay.style.zIndex = "2147483647";
      overlay.style.boxSizing = "border-box";

      const label = document.createElement("div");
      label.innerText = `${el.id}`;
      label.style.position = "absolute";
      label.style.top = "-20px";
      label.style.left = "0";
      label.style.padding = "2px 6px";
      label.style.background = borderColor;
      label.style.color = "white";
      label.style.fontSize = "11px";
      label.style.fontWeight = "bold";
      label.style.fontFamily = "monospace";
      label.style.borderRadius = "3px";
      label.style.whiteSpace = "nowrap";
      label.style.boxShadow = "0 1px 3px rgba(0,0,0,0.3)";

      overlay.appendChild(label);
      document.body.appendChild(overlay);
    }
  }, elements);
}

export async function labelElementsNode(state: AnnotationHandlerType) {
  const page = state.page;
  if (!page) throw new Error("Page not found in state");

  const interactiveElements = await getInteractiveElements(page);
  await labelElements(page, interactiveElements);
  return {
    interactiveElements,
  };
}
