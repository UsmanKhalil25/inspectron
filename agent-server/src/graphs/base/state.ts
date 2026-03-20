import * as z from "zod";
import type { Page } from "playwright";
import { MessagesZodMeta } from "@langchain/langgraph";
import { registry } from "@langchain/langgraph/zod";
import { type BaseMessage } from "@langchain/core/messages";

import { PageElementSchema } from "../../schemas/page-elements";

export const AgentState = z.object({
  messages: z
    .array(z.custom<BaseMessage>())
    .register(registry, MessagesZodMeta),
  llmCalls: z.number().optional(),
  page: z.custom<Page>(),
  input: z.string(),
  img: z.string().optional(),
  interactiveElements: z.array(PageElementSchema).optional(),
  credentials: z
    .object({
      username: z.string(),
      password: z.string(),
    })
    .optional(),
  loginCompleted: z.boolean().optional(),
  loginUrl: z.string().optional(),
  visitedUrls: z.array(z.string()).optional(),
  crawlGoal: z
    .object({
      targetPageCount: z.number(),
      currentPageCount: z.number(),
    })
    .optional(),
});

export type AgentStateType = z.infer<typeof AgentState>;
