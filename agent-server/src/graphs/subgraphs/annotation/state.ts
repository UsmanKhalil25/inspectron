import { z } from "zod";
import { Annotation } from "@langchain/langgraph";
import type { Page } from "playwright";

import {
  PageElement,
  PageElementSchema,
} from "../../../libs/schemas/page-elements";

// Schema is the single source of truth (SSOT)
export const AnnotationGraphSchema = z.object({
  interactiveElements: z.array(PageElementSchema).optional(),
  page: z.custom<Page>().optional(),
  currentScreenshotPath: z.string().optional(),
});

// Type is derived from schema
export type AnnotationGraphStateType = z.infer<typeof AnnotationGraphSchema>;

// Annotation uses the same shape as the schema
export const AnnotationGraphState = Annotation.Root({
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
