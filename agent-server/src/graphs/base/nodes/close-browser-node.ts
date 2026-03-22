import { BrowserManager } from "../../../libs";

export async function closeBrowserNode() {
  await BrowserManager.cleanup();

  // TODO: Check if we need to clean up the state here?
}
