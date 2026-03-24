import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import type { Page } from "playwright";
import { z } from "zod";
import { PageElement, PageElementSchema } from "../../libs/schemas";

// Schema is the single source of truth (SSOT)
export const MainGraphSchema = z.object({
  userInput: z.string(),
  messages: z.array(z.custom<BaseMessage>()),
  targetUrl: z.string().optional(),
  interactiveElements: z.array(PageElementSchema).optional(),
  page: z.custom<Page>().optional(),
  currentScreenshotPath: z.string().optional(),
  mainAgentAction: z.enum(["continue", "complete"]).optional(),
  browserInstruction: z.string().optional(),
});

// Type is derived from schema
export type MainGraphStateType = z.infer<typeof MainGraphSchema>;

// Annotation uses the same shape as the schema
export const MainGraphState = Annotation.Root({
  userInput: Annotation<string>({
    reducer: (x, y) => x.concat(y),
    default: () => "",
  }),
  messages: Annotation<BaseMessage[]>({
    reducer: messagesStateReducer,
    default: () => [],
  }),
  targetUrl: Annotation<string | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  interactiveElements: Annotation<PageElement[] | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  page: Annotation<Page | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  currentScreenshotPath: Annotation<string | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  mainAgentAction: Annotation<"continue" | "complete" | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  browserInstruction: Annotation<string | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
});
