import { SystemMessage, BaseMessage } from "@langchain/core/messages";
import { z } from "zod";
import { LlmFactory } from "../clients/llm";

interface BaseState {
  messages: BaseMessage[];
}

export interface CreateStructuredNodeConfig {
  tags?: string[];
}

export function createStructuredNode<
  TState extends BaseState,
  TOutput extends Record<string, unknown>,
>(
  schema: z.ZodType<TOutput>,
  systemPrompt: string,
  stateMapper: (result: TOutput, state: TState) => Record<string, unknown>,
  config?: CreateStructuredNodeConfig,
) {
  return async (state: TState) => {
    let model = LlmFactory.getLLM().withStructuredOutput<TOutput>(schema);
    if (config?.tags) {
      model = model.withConfig({ tags: config.tags });
    }
    const messages: BaseMessage[] = [
      new SystemMessage(systemPrompt),
      ...state.messages,
    ];
    const result = await model.invoke(messages);

    return stateMapper(result, state);
  };
}
