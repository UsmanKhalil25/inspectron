import { AnnotateStateType } from "../state";

export async function screenshotNode(state: AnnotateStateType) {
  const page = state.page;
  const screenshot = await page.screenshot();
  const base64Image = screenshot.toString("base64");

  return {
    img: base64Image,
  };
}
