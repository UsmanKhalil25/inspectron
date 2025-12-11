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
import {
  INITIAL_AGENT_PROMPT,
  WEB_BROWSING_AGENT_PROMPT,
  SCREENSHOT_OBSERVATION_TEXT,
} from "./prompts.js";

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
      const htmlEl = el as HTMLElement;

      const style = window.getComputedStyle(htmlEl);
      const isVisible =
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.opacity !== "0" &&
        htmlEl.offsetParent !== null;

      if (isVisible) {
        result.push({
          id: index + 1,
          tag: el.tagName.toLowerCase(),
          text: htmlEl.innerText?.trim() || null,
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

export async function shouldInitializeBrowser(state: AgentStateType) {
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage == null || !AIMessage.isInstance(lastMessage)) return END;

  if (lastMessage.tool_calls?.length) {
    return "initialization";
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

export async function ensurePageNode(state: AgentStateType) {
  const page = state.page;

  try {
    await page.waitForLoadState("load", { timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 5000 });
  } catch (error) {
    console.log("Page load timeout, continuing anyway");
  }

  return state;
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

export async function initialLLMCallNode(state: AgentStateType) {
  const model = LlmFactory.getLLM();

  const tools = [navigate(state)];
  const modelWithTools = model.bindTools(tools);

  const messages = [new SystemMessage(INITIAL_AGENT_PROMPT), ...state.messages];

  return {
    messages: await modelWithTools.invoke(messages),
    llmCalls: (state.llmCalls ?? 0) + 1,
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
    new SystemMessage(WEB_BROWSING_AGENT_PROMPT),
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
            text: SCREENSHOT_OBSERVATION_TEXT,
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
