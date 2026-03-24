import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { z } from "zod";
import { PageElement, PageElementSchema } from "../../libs/schemas";

// Schema is the single source of truth (SSOT)
export const MainGraphSchema = z.object({
  userInput: z.string(),
  messages: z.array(z.custom<BaseMessage>()),
  targetUrl: z.string().optional(),
  interactiveElements: z.array(PageElementSchema).optional(),
  currentScreenshotPath: z.string().optional(),
  nextNode: z
    .enum([
      "browser_agent",
      // "captcha_handler",
      "close_browser",
      "input_handler",
    ])
    .optional(),
  browserInstruction: z.string().optional(),
  captchaType: z.string().optional(),
  solved: z.boolean().optional(),
  inputHandlerInstruction: z.string().optional(),
  inputHandlerElementId: z.number().optional(),
  inputHandlerFieldType: z.enum(["text", "password"]).optional(),
  inputHandlerValue: z.string().optional(),
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
  currentScreenshotPath: Annotation<string | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  nextNode: Annotation<
    | "browser_agent"
    // | "captcha_handler"
    | "close_browser"
    | "input_handler"
    | undefined
  >({
    value: (_, y) => y,
    default: () => undefined,
  }),
  browserInstruction: Annotation<string | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  captchaType: Annotation<string | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  solved: Annotation<boolean | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  inputHandlerInstruction: Annotation<string | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  inputHandlerElementId: Annotation<number | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  inputHandlerFieldType: Annotation<"text" | "password" | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  inputHandlerValue: Annotation<string | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
});
