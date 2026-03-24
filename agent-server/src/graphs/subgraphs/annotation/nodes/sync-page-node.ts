import { Logger } from "../../../../libs/utils";
import { BrowserManager } from "../../../../libs";
import type { MainGraphStateType } from "../../../base/state";

export async function syncPageNode(_state: MainGraphStateType) {
  const page = await BrowserManager.getPage();
  if (!page) throw new Error("Page not available");

  try {
    await page.waitForLoadState("load", { timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 5000 });
  } catch {
    Logger.warn("sync-page", "Page load timeout, continuing anyway");
  }

  return {};
}
