import type { AnnotationHandlerType } from "../state";
import { Logger } from "../../../../libs/utils";

export async function syncPageNode(state: AnnotationHandlerType) {
  const page = state.page;
  if (!page) throw new Error("Page not found in state");

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
