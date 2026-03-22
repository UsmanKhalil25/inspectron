import { Annotation } from "@langchain/langgraph";
import type { Page } from "playwright";

import { PageElement } from "../../../libs/schemas/page-elements";

export const AnnotateStateSchema = {
  page: Annotation<Page | undefined>(),
  interactiveElements: Annotation<PageElement[]>({
    reducer: (x, y) => (y.length ? y : x),
    default: () => [],
  }),
  img: Annotation<string | undefined>(),
};

export type AnnotateStateType = {
  page: Page;
  interactiveElements: PageElement[];
  img?: string;
};

export const AnnotateState = Annotation.Root(AnnotateStateSchema);
