import { z } from "zod";
import { AIMessage } from "@langchain/core/messages";
import { createStructuredNode } from "../../../libs/create-structured-output-node";
import { INITIAL_AGENT_PROMPT } from "../prompts";
import { MainStateType } from "../state";

const InitialPlanSchema = z.object({
  complexity: z.enum(["simple", "needs_browser"]),
  reasoning: z.string(),
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
    needsBrowser: result.complexity === "needs_browser",
    targetUrl: result.targetUrl ?? undefined,
    messages: [new AIMessage(result.message)],
  }),
);
