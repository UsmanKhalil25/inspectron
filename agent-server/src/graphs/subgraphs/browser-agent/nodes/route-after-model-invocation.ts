import { END } from "@langchain/langgraph";
import { AIMessage } from "@langchain/core/messages";

import type { MainGraphStateType } from "../../../base/state";

export function routeAfterModelInvocation(
  state: MainGraphStateType,
): "execute_tools" | typeof END {
  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1] as AIMessage;

  if (lastMessage?.tool_calls?.length) {
    return "execute_tools";
  }

  return END;
}
