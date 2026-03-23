import { z } from "zod";
import { AIMessage } from "@langchain/core/messages";
import { createStructuredNode } from "../../../libs/create-structured-output-node";
import { MainStateType } from "../state";

import { INITIAL_AGENT_PROMPT } from "../prompts";
const InitialPlanSchema = z.object({
  targetUrl: z.string().nullable().default(null),
  message: z
    .string()
    .describe(
      "A conversational response to the user explaining your plan and reasoning",
    ),
});

type InitialPlan = z.infer<typeof InitialPlanSchema>;

export const initialPlanNode = createStructuredNode<MainStateType, InitialPlan>(
  InitialPlanSchema,
  INITIAL_AGENT_PROMPT,
  (result) => ({
    targetUrl: result.targetUrl ?? undefined,
    messages: [new AIMessage(result.message)],
  }),
  { tags: ["langsmith:nostream"] },
);
