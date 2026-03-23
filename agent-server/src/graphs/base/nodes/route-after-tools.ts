import type { MainGraphStateType } from "../state";

export function routeAfterTools(
  state: MainGraphStateType,
): "annotation" | "close_browser" {
  if (state.taskComplete) {
    return "close_browser";
  }
  return "annotation";
}
