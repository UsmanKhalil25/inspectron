import { createAgent } from "langchain";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AIMessage } from "@langchain/core/messages";

import { BrowserService } from "../../services/browser-service";
import { PageElement } from "../../types";
import { clickTool, scrollTool } from "./tools";

export class CrawlAgent {
  private llm: BaseChatModel;
  private browserService: BrowserService;
  private currentElements: PageElement[];

  constructor(llm: BaseChatModel, browserService: BrowserService) {
    this.llm = llm;
    this.browserService = browserService;
    this.currentElements = [];
  }

  async decide(screenshot: Buffer, elements: PageElement[]): Promise<void> {
    this.currentElements = elements;

    const tools = [
      clickTool(this.browserService, this.currentElements),
      scrollTool(this.browserService, this.currentElements),
    ];

    const agent = createAgent({
      model: this.llm,
      tools: tools,
      systemPrompt:
        "You are a web crawling agent. Analyze the screenshot and decide which element to interact with. The elements are labeled with numbers.",
    });

    const response = await agent.invoke({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze the screenshot and decide which element to interact with.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${screenshot.toString("base64")}`,
              },
            },
          ],
        },
      ],
    });
  }
}
