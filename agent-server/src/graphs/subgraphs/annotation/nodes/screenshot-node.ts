import type { AnnotationGraphStateType } from "../state";
import { saveImage } from "../../../../libs/utils";

export async function screenshotNode(state: AnnotationGraphStateType) {
  const page = state.page;
  if (!page) throw new Error("Page not found in state");

  const screenshot = await page.screenshot();
  const base64Image = screenshot.toString("base64");

  const currentScreenshotPath = await saveImage(base64Image);

  return {
    currentScreenshotPath,
  };
}
