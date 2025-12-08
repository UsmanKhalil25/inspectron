import { StateGraph } from "@langchain/langgraph";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

import { BrowserService } from "../../services/browser-service";
import { CrawlStateService } from "../../services/crawl-state-service";
import { CrawlAgent } from "./agent";
import {
  agentDecideNode,
  captureAndLabelNode,
  checkNavigationNode,
  navigateNode,
  shouldContinue,
} from "./nodes";
import { CrawlStateAnnotation } from "./state";

export class CrawlWorkflow {
  private llm: BaseChatModel;
  private browserService: BrowserService;
  private crawlStateService: CrawlStateService;

  constructor(
    llm: BaseChatModel,
    browserService: BrowserService,
    crawlStateService: CrawlStateService,
  ) {
    this.llm = llm;
    this.browserService = browserService;
    this.crawlStateService = crawlStateService;
  }

  private buildGraph() {
    const workflow = new StateGraph(CrawlStateAnnotation)
      .addNode("navigate", navigateNode)
      .addNode("captureAndLabel", captureAndLabelNode)
      .addNode("agentDecide", agentDecideNode)
      .addNode("checkNavigation", checkNavigationNode)
      .addEdge("__start__", "navigate")
      .addEdge("navigate", "captureAndLabel")
      .addEdge("captureAndLabel", "agentDecide")
      .addEdge("agentDecide", "checkNavigation")
      .addConditionalEdges("checkNavigation", shouldContinue, {
        continue: "navigate",
        end: "__end__",
      })
      .compile();

    return workflow;
  }

  async execute() {
    const graph = this.buildGraph();
    const agent = new CrawlAgent(this.llm, this.browserService);

    const initialState = {
      url: null,
      screenshot: null,
      elements: [],
      browserService: this.browserService,
      crawlStateService: this.crawlStateService,
      agent,
    };

    await graph.invoke(initialState, { recursionLimit: 1000 });
  }
}
