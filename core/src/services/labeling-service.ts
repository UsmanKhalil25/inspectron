import { Page } from "playwright";

import { PageElement } from "../types";

export class LabelingService {
  static async labelElements(page: Page, elements: PageElement[]) {
    await page.evaluate((items) => {
      items.forEach((el) => {
        const div = document.createElement("div");
        div.style.position = "absolute";
        div.style.left = `${el.boundingBox.x + window.scrollX}px`;
        div.style.top = `${el.boundingBox.y + window.scrollY}px`;
        div.style.width = `${el.boundingBox.width}px`;
        div.style.height = `${el.boundingBox.height}px`;

        div.style.border = "2px dashed red";
        div.style.zIndex = "999999";
        div.style.pointerEvents = "none";

        const label = document.createElement("div");
        label.innerText = `${el.id}`;
        label.style.position = "absolute";
        label.style.top = "-18px";
        label.style.left = "0";
        label.style.padding = "2px 4px";
        label.style.background = "red";
        label.style.color = "white";
        label.style.fontSize = "16px";
        label.style.fontWeight = "bold";
        label.style.fontFamily = "monospace";

        div.appendChild(label);
        document.body.appendChild(div);
      });
    }, elements);
  }
}
