import type { MainGraphStateType } from "../state";

export function routeAfterMainAgent(
  state: MainGraphStateType,
): "browser_agent" | "close_browser" {
  return state.mainAgentAction === "continue" ? "browser_agent" : "close_browser";
}
