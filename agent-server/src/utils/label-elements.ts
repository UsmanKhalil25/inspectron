import { Page } from "playwright";
import type { PageElement } from "../schemas/page-elements.js";

export async function labelElements(page: Page, elements: PageElement[]) {
  await page.evaluate((items) => {
    function getRandomColor() {
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }

    items.forEach((el) => {
      const borderColor = getRandomColor();

      const div = document.createElement("div");
      div.style.position = "absolute";
      div.style.left = `${el.boundingBox.x + window.scrollX}px`;
      div.style.top = `${el.boundingBox.y + window.scrollY}px`;
      div.style.width = `${el.boundingBox.width}px`;
      div.style.height = `${el.boundingBox.height}px`;

      div.style.outline = `2px dashed ${borderColor}`;
      div.style.pointerEvents = "none";
      div.style.zIndex = "2147483647";
      div.style.boxSizing = "border-box";

      const label = document.createElement("div");
      label.innerText = `${el.id}`;
      label.style.position = "absolute";
      label.style.top = "-19px";
      label.style.left = "0";
      label.style.padding = "2px 4px";
      label.style.background = borderColor;
      label.style.color = "white";
      label.style.fontSize = "12px";
      label.style.fontWeight = "bold";
      label.style.fontFamily = "monospace";
      label.style.borderRadius = "2px";

      div.appendChild(label);
      document.body.appendChild(div);
    });
  }, elements);
}
