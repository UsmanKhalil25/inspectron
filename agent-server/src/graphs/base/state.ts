import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import type { Page } from "playwright";
import { z } from "zod";
import { PageElement, PageElementSchema } from "../../libs/schemas";

export const MainState = Annotation.Root({
  userInput: Annotation<string>({
    reducer: (x, y) => x.concat(y),
    default: () => "",
  }),
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
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
});

export const MainStateSchema = z.object({
  userInput: z.string(),
  messages: z.array(z.custom<BaseMessage>()),
  targetUrl: z.string().optional(),
  interactiveElements: z.array(PageElementSchema).optional(),
  page: z.custom<Page>().optional(),
  currentScreenshotPath: z.string().optional(),
});

export type MainStateType = z.infer<typeof MainStateSchema>;
