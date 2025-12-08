import { Annotation } from "@langchain/langgraph";

import { BrowserService } from "../../services/browser-service";
import { CrawlStateService } from "../../services/crawl-state-service";
import { PageElement } from "../../types";
import { CrawlAgent } from "./agent";

export const CrawlStateAnnotation = Annotation.Root({
  url: Annotation<string | null>,
  screenshot: Annotation<Buffer | null>,
  elements: Annotation<PageElement[]>,
  browserService: Annotation<BrowserService>,
  crawlStateService: Annotation<CrawlStateService>,
  agent: Annotation<CrawlAgent>,
});

export type CrawlState = typeof CrawlStateAnnotation.State;
