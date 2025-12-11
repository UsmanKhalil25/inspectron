import type { Page } from "playwright";

import type { PageElement } from "../schemas/page-elements.js";
import {
  SystemMessage,
  AIMessage,
  HumanMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { END } from "@langchain/langgraph";

import { AgentStateType } from "./state.js";
import { labelElements } from "../utils/label-elements.js";
import { LlmFactory, BrowserFactory } from "./factory";
import { click, type, scroll, goBack, wait, navigate } from "./tools.js";

export async function getInteractiveElements(
  page: Page,
): Promise<PageElement[]> {
  return page.evaluate(() => {
    const selectors = [
      "input",
      "textarea",
      "button",
      "[role=button]",
      "[onclick]",
      "a[href]",
      "select",
      "iframe",
      "video",
    ];

    const elements = document.querySelectorAll(selectors.join(","));
    const result: PageElement[] = [];

    elements.forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        result.push({
          id: index + 1,
          tag: el.tagName.toLowerCase(),
          text: (el as HTMLElement).innerText?.trim() || null,
          boundingBox: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          },
        });
      }
    });

    return result;
  });
}

export async function initializationNode(state: AgentStateType) {
  await BrowserFactory.launch();
  const page = await BrowserFactory.getPage();
  return {
    ...state,
    page,
  };
}

export async function shouldContinue(state: AgentStateType) {
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage == null || !AIMessage.isInstance(lastMessage)) return END;

  if (lastMessage.tool_calls?.length) {
    return "toolNode";
  }

  return END;
}

export async function cleanupNode(state: AgentStateType) {
  await BrowserFactory.cleanup();
  return {
    ...state,
    img: undefined,
    interactiveElements: [],
  };
}

export async function labelElementsNode(state: AgentStateType) {
  const page = state.page;
  const interactiveElements = await getInteractiveElements(page);
  await labelElements(page, interactiveElements);
  return {
    ...state,
    interactiveElements,
  };
}

export async function captureScreenshotNode(state: AgentStateType) {
  const page = state.page;
  const screenshot = await page.screenshot({ fullPage: true, type: "png" });
  const base64Image = screenshot.toString("base64");
  return {
    ...state,
    img: base64Image,
  };
}

export async function llmCallNode(state: AgentStateType) {
  const model = LlmFactory.getLLM();
  const tools = [
    click(state),
    type(state),
    scroll(state),
    wait(state),
    goBack(state),
    navigate(state),
  ];
  const modelWithTools = model.bindTools(tools);

  const messages = [
    new SystemMessage(
      "You are an AI agent that interacts with web pages. Use the available tools to perform actions on the page based on the user's requests and the current state of the page. You will receive screenshots of the page with interactive elements labeled by ID numbers.",
    ),
    ...state.messages,
  ];

  if (state.img) {
    messages.push(
      new HumanMessage({
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${state.img}`,
            },
          },
          {
            type: "text",
            text: "Here is the current state of the page with labeled interactive elements. Use the element IDs to interact with them.",
          },
        ],
      }),
    );
  }

  return {
    messages: await modelWithTools.invoke(messages),
    llmCalls: (state.llmCalls ?? 0) + 1,
  };
}

export async function toolNode(state: AgentStateType) {
  const lastMessage = state.messages[state.messages.length - 1];

  if (lastMessage == null || !AIMessage.isInstance(lastMessage)) {
    return { messages: [] };
  }

  const toolsByName: Record<string, any> = {
    click: click(state),
    type: type(state),
    scroll: scroll(state),
    wait: wait(state),
    go_back: goBack(state),
    navigate: navigate(state),
  };

  const result: ToolMessage[] = [];
  for (const toolCall of lastMessage.tool_calls ?? []) {
    const tool = toolsByName[toolCall.name];
    if (tool) {
      const observation = await tool.invoke(toolCall);
      result.push(observation);
    }
  }

  return { messages: result };
}
