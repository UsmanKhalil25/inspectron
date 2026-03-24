import type { MainGraphStateType } from "../state";
import { BrowserManager } from "../../../libs";

export async function openBrowserNode(state: MainGraphStateType) {
  if (!state.targetUrl)
    throw new Error("openBrowserNode called without a targetUrl in state");

  await BrowserManager.launch();
  const page = await BrowserManager.getPage();
  await page.goto(state.targetUrl, { waitUntil: "networkidle" });

  return {};
}
