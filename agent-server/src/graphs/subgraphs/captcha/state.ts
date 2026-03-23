import { z } from "zod";
import { Annotation } from "@langchain/langgraph";
import type { Page } from "playwright";

// Schema is the single source of truth (SSOT)
export const CaptchaGraphSchema = z.object({
  img: z.string().optional(),
  captchaType: z.string().optional(),
  solved: z.boolean().optional(),
  url: z.string().optional(),
  page: z.custom<Page>().optional(),
});

// Type is derived from schema
export type CaptchaGraphStateType = z.infer<typeof CaptchaGraphSchema>;

// Annotation uses the same shape as the schema
export const CaptchaGraphState = Annotation.Root({
  img: Annotation<string | undefined>({
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
  url: Annotation<string | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  page: Annotation<Page | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
});
