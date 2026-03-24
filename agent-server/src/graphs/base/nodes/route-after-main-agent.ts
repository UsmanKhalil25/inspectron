import type { MainGraphStateType } from "../state";

export function routeAfterMainAgent(
  state: MainGraphStateType,
): "browser_agent" | "close_browser" {
  return state.nextNode === "browser_agent" ? "browser_agent" : "close_browser";
}
