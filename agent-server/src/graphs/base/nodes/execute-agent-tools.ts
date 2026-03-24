import { AIMessage, ToolMessage } from "@langchain/core/messages";
import { StructuredTool } from "@langchain/core/tools";

import {
  click,
  typeText,
  scroll,
  navigate,
  wait,
  goBack,
  getText,
} from "../tools";
import type { MainGraphStateType } from "../state";

export async function executeAgentTools(state: MainGraphStateType) {
  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1] as AIMessage;

  if (!lastMessage?.tool_calls?.length) {
    return { messages: [] };
  }

  const tools: StructuredTool[] = [
    click(state),
    typeText(state),
    scroll(state),
    navigate(state),
    wait(state),
    goBack(state),
    getText(state),
  ];

  const toolResults: ToolMessage[] = [];

  for (const toolCall of lastMessage.tool_calls) {
    const tool = tools.find((t) => t.name === toolCall.name);

    if (!tool) {
      toolResults.push(
        new ToolMessage({
          content: `Error: Tool ${toolCall.name} not found`,
          tool_call_id: toolCall.id!,
        }),
      );
      continue;
    }

    try {
      const result: unknown = await tool.invoke(toolCall.args);
      toolResults.push(
        new ToolMessage({
          content: String(result),
          tool_call_id: toolCall.id!,
        }),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toolResults.push(
        new ToolMessage({
          content: `Error executing tool ${toolCall.name}: ${errorMessage}`,
          tool_call_id: toolCall.id!,
        }),
      );
    }
  }

  return { messages: toolResults };
}
