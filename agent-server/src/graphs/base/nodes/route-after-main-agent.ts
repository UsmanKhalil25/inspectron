import type { MainGraphStateType } from "../state";

export function routeAfterMainAgent(
  state: MainGraphStateType,
): "browser_agent" | "captcha_handler" | "close_browser" {
  if (state.nextNode === "browser_agent") return "browser_agent";
  if (state.nextNode === "captcha_handler") return "captcha_handler";
  return "close_browser";
}
