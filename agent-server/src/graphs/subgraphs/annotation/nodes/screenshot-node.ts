import type { MainGraphStateType } from "../../../base/state";
import { saveImage } from "../../../../libs/utils";
import { BrowserManager } from "../../../../libs";

export async function screenshotNode(_state: MainGraphStateType) {
  const page = await BrowserManager.getPage();
  if (!page) throw new Error("Page not available");

  const screenshot = await page.screenshot();
  const base64Image = screenshot.toString("base64");

  const currentScreenshotPath = await saveImage(base64Image);

  return {
    currentScreenshotPath,
  };
}
