import { AnnotateStateType } from "../state";
import { ScreenshotStorage } from "../../../../libs/utils";

export async function screenshotNode(state: AnnotateStateType) {
  const page = state.page;
  const screenshot = await page.screenshot();

  // Save screenshot to disk for debugging
  ScreenshotStorage.saveScreenshot(screenshot);

  const base64Image = screenshot.toString("base64");

  return {
    img: base64Image,
  };
}
