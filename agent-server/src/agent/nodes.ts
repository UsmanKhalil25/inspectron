import * as z from "zod";
import {
  SystemMessage,
  AIMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { END } from "@langchain/langgraph";
import { MessagesState } from "./state.js";
import { tools, toolsByName } from "./tools.js";
import { LLMFactory } from "./factory.js";

export async function llmCall(state: z.infer<typeof MessagesState>) {
  const model = LLMFactory.getLLM();
  const modelWithTools = model.bindTools(tools);

  return {
    messages: await modelWithTools.invoke([
      new SystemMessage(
        "You are a helpful assistant tasked with performing arithmetic on a set of inputs.",
      ),
      ...state.messages,
    ]),
    llmCalls: (state.llmCalls ?? 0) + 1,
  };
}

export async function toolNode(state: z.infer<typeof MessagesState>) {
  const lastMessage = state.messages.at(-1);

  if (lastMessage == null || !AIMessage.isInstance(lastMessage)) {
    return { messages: [] };
  }

  const result: ToolMessage[] = [];
  for (const toolCall of lastMessage.tool_calls ?? []) {
    const tool = toolsByName[toolCall.name];
    const observation = await tool.invoke(toolCall);
    result.push(observation);
  }

  return { messages: result };
}

export async function shouldContinue(state: z.infer<typeof MessagesState>) {
  const lastMessage = state.messages.at(-1);
  if (lastMessage == null || !AIMessage.isInstance(lastMessage)) return END;

  if (lastMessage.tool_calls?.length) {
    return "toolNode";
  }

  return END;
}
