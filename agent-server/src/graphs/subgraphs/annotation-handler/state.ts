import { z } from "zod";
import { Annotation } from "@langchain/langgraph";
import type { Page } from "playwright";

import {
  PageElement,
  PageElementSchema,
} from "../../../libs/schemas/page-elements";

export const AnnotationHandlerState = Annotation.Root({
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

export const AnnotationHandlerSchema = z.object({
  interactiveElements: z.array(PageElementSchema).optional(),
  page: z.custom<Page>().optional(),
  currentScreenshotPath: z.string().optional(),
});

export type AnnotationHandlerType = z.infer<typeof AnnotationHandlerSchema>;
