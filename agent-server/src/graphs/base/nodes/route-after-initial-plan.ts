import { END } from "@langchain/langgraph";

import { MainStateType } from "../state";

export function routeAfterInitialPlan(
  state: MainStateType,
): "openBrowser" | typeof END {
  return state.targetUrl ? "openBrowser" : END;
}
