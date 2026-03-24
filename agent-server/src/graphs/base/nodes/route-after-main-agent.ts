import type { MainGraphStateType } from "../state";

export function routeAfterMainAgent(
  state: MainGraphStateType,
): "browser_agent" | "input_handler" | "close_browser" {
  if (state.nextNode === "browser_agent") return "browser_agent";
  // if (state.nextNode === "captcha_handler") return "captcha_handler";
  if (state.nextNode === "input_handler") return "input_handler";
  return "close_browser";
}
