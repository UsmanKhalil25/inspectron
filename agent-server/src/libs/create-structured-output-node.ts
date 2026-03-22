import { SystemMessage, BaseMessage } from "@langchain/core/messages";
import { z } from "zod";
import { LlmFactory } from "../clients/llm";

interface BaseState {
  messages: BaseMessage[];
  llmCalls?: number;
}

export function createStructuredNode<
  TState extends BaseState,
  TOutput extends Record<string, unknown>,
>(
  schema: z.ZodType<TOutput>,
  systemPrompt: string,
  stateMapper: (result: TOutput, state: TState) => Record<string, unknown>,
) {
  return async (state: TState) => {
    const model = LlmFactory.getLLM().withStructuredOutput<TOutput>(
      schema as any,
    );
    const messages: BaseMessage[] = [
      new SystemMessage(systemPrompt),
      ...state.messages,
    ];
    const result = await model.invoke(messages);

    return {
      ...stateMapper(result, state),
      llmCalls: (state.llmCalls ?? 0) + 1,
    };
  };
}
