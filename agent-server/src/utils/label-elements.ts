import { Page } from "playwright";
import type { PageElement } from "../schemas/page-elements.js";

export async function labelElements(page: Page, elements: PageElement[]) {
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
