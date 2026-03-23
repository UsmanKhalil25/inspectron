import { END } from "@langchain/langgraph";

import type { MainGraphStateType } from "../state";

export function routeAfterInitialPlan(
  state: MainGraphStateType,
): "open_browser" | typeof END {
  return state.targetUrl ? "open_browser" : END;
}
