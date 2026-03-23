import { AnnotateStateType } from "../state";
import { Logger } from "../../../../libs/utils";

export async function syncPageNode(state: AnnotateStateType) {
  const page = state.page;

  try {
    await page.waitForLoadState("load", { timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 5000 });
  } catch {
    Logger.warn("sync-page", "Page load timeout, continuing anyway");
  }

  return {
    page,
  };
}
