import { AIMessage } from "@langchain/core/messages";

import type { MainGraphStateType } from "../state";

export function routeAfterModelInvocation(
  state: MainGraphStateType,
): "execute_tools" | "close_browser" {
  if (state.taskComplete) {
    return "close_browser";
  }

  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1] as AIMessage;

  if (lastMessage?.tool_calls?.length) {
    return "execute_tools";
  }

  return "close_browser";
}
