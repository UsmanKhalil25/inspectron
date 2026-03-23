import { AIMessage, ToolMessage } from "@langchain/core/messages";

import { click, typeText, scroll, navigate, wait, goBack } from "../tools";
import type { MainGraphStateType } from "../state";

const EXIT_TOOL_NAME = "exit";

export async function executeAgentTools(state: MainGraphStateType) {
  const messages = state.messages || [];
  const lastMessage = messages[messages.length - 1] as AIMessage;

  if (!lastMessage?.tool_calls?.length) {
    return { messages: [], taskComplete: false };
  }

  const hasExitTool = lastMessage.tool_calls.some(
    (toolCall) => toolCall.name === EXIT_TOOL_NAME,
  );

  if (hasExitTool) {
    const exitToolCall = lastMessage.tool_calls.find(
      (toolCall) => toolCall.name === EXIT_TOOL_NAME,
    );
    return {
      messages: [
        new ToolMessage({
          content: "Task marked as complete. The browser will be closed.",
          tool_call_id: exitToolCall!.id!,
        }),
      ],
      taskComplete: true,
    };
  }

  const tools = [
    click(state),
    typeText(state),
    scroll(state),
    navigate(state),
    wait(state),
    goBack(state),
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
      const result = await (tool as any).invoke(toolCall.args);
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

  return { messages: toolResults, taskComplete: false };
}
