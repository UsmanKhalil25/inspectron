import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import type { Page } from "playwright";
import { z } from "zod";
import { PageElement, PageElementSchema } from "../../libs/schemas";

export type NextStep = "close" | "annotationHandler" | "inputHandler";

export const InputFieldSchema = z.object({
  id: z.number().describe("Element ID from interactive elements"),
  label: z.string().describe("Human-readable label for the field"),
  type: z
    .enum([
      "text",
      "email",
      "password",
      "tel",
      "number",
      "url",
      "search",
      "textarea",
    ])
    .optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
});

export const InputRequestSchema = z.object({
  fields: z.array(InputFieldSchema).describe("Fields that need user input"),
  prompt: z.string().describe("What input is needed and why"),
  context: z.string().optional().describe("Additional context for the user"),
});

export type InputField = z.infer<typeof InputFieldSchema>;
export type InputRequest = z.infer<typeof InputRequestSchema>;

export const MainState = Annotation.Root({
  input: Annotation<string>({
    reducer: (x, y) => x.concat(y),
    default: () => "",
  }),
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  needsBrowser: Annotation<boolean>({
    value: (_, y) => y,
    default: () => false,
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
  img: Annotation<string | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  goal: Annotation<string>({
    default: () => "",
    reducer: (_, y) => y,
  }),
  nextStep: Annotation<NextStep | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  visitedUrls: Annotation<string[]>({
    default: () => [],
    reducer: (x, y) => [...new Set([...x, ...y])],
  }),
  inputRequest: Annotation<InputRequest | undefined>(),
  inputValues: Annotation<Record<string, string> | undefined>(),
});

export const MainStateSchema = z.object({
  input: z.string(),
  messages: z.array(z.custom<BaseMessage>()),
  llmCalls: z.number().optional(),
  needsBrowser: z.boolean().default(false),
  targetUrl: z.string().optional(),
  interactiveElements: z.array(PageElementSchema).optional(),
  page: z.custom<Page>().optional(),
  img: z.string().optional(),
  goal: z.string().default(""),
  nextStep: z.enum(["close", "annotationHandler", "inputHandler"]).optional(),
  visitedUrls: z.array(z.string()).default([]),
  inputRequest: InputRequestSchema.optional(),
  inputValues: z.record(z.string(), z.string()).optional(),
});

export type MainStateType = z.infer<typeof MainStateSchema>;
