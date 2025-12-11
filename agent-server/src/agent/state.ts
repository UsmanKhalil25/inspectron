import * as z from "zod";
import type { Page } from "playwright";
import { MessagesZodMeta } from "@langchain/langgraph";
import { registry } from "@langchain/langgraph/zod";
import { type BaseMessage } from "@langchain/core/messages";

import { PageElementSchema } from "../schemas/page-elements.js";

const PredictionSchema = z.object({
  summary: z.string(),
});

export const AgentState = z.object({
  messages: z
    .array(z.custom<BaseMessage>())
    .register(registry, MessagesZodMeta),
  llmCalls: z.number().optional(),
  page: z.custom<Page>(),
  input: z.string(),
  img: z.string().optional(),
  interactiveElements: z.array(PageElementSchema).optional(),
});

export type Prediction = z.infer<typeof PredictionSchema>;
export type AgentStateType = z.infer<typeof AgentState>;
