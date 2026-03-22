import type { MainStateType } from "../state";
import { BrowserManager } from "../../../libs";

export async function openBrowserNode(state: MainStateType) {
  if (!state.targetUrl)
    throw new Error("openBrowserNode called without a targetUrl in state");

  await BrowserManager.launch();
  const page = await BrowserManager.getPage();
  await page.goto(state.targetUrl, { waitUntil: "networkidle" });

  return { page };
}
