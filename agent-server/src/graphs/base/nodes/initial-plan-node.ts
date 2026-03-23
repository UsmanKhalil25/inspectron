import { z } from "zod";
import { AIMessage, SystemMessage } from "@langchain/core/messages";
import { LlmFactory } from "../../../clients/llm";
import type { MainGraphStateType } from "../state";
import { INITIAL_AGENT_PROMPT } from "../prompts";

const InitialPlanSchema = z.object({
  targetUrl: z.string().nullable().default(null),
  message: z.string(),
});

export async function initialPlanNode(state: MainGraphStateType) {
  const model = LlmFactory.getLLM().withStructuredOutput(InitialPlanSchema);
  const messages = [new SystemMessage(INITIAL_AGENT_PROMPT), ...state.messages];

  const result = await model.invoke(messages);

  return {
    targetUrl: result.targetUrl ?? undefined,
    messages: [new AIMessage(result.message)],
  };
}
