import {
  StateGraph,
  MessagesAnnotation,
  START,
  END,
} from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { AIMessage } from "@langchain/core/messages";
import { StructuredToolInterface } from "@langchain/core/tools";
import {
  BaseChatModel,
  BindToolsInput,
} from "@langchain/core/language_models/chat_models";
import { BaseLanguageModelInput } from "@langchain/core/language_models/base";
import { AIMessageChunk } from "@langchain/core/messages";
import { Runnable } from "@langchain/core/runnables";

type ChatModelWithTools = BaseChatModel & {
  bindTools(
    tools: BindToolsInput[],
    kwargs?: Record<string, unknown>,
  ): Runnable<BaseLanguageModelInput, AIMessageChunk>;
};

export interface CreateAgentOptions {
  tags?: string[];
}

export function createAgent(
  model: ChatModelWithTools,
  tools: StructuredToolInterface[],
  options?: CreateAgentOptions,
) {
  const modelWithTools = model.bindTools(tools);
  const toolNode = new ToolNode(tools);

  async function llmNode(state: typeof MessagesAnnotation.State) {
    const config = options?.tags ? { tags: options.tags } : undefined;
    const response = await modelWithTools.invoke(state.messages, config);
    return { messages: [response] };
  }

  function shouldContinue(state: typeof MessagesAnnotation.State) {
    const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
    if (lastMessage.tool_calls?.length) {
      return "tools";
    }
    return END;
  }

  return new StateGraph(MessagesAnnotation)
    .addNode("llm", llmNode)
    .addNode("tools", toolNode)
    .addEdge(START, "llm")
    .addConditionalEdges("llm", shouldContinue)
    .addEdge("tools", "llm")
    .compile();
}
