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
import { DebugLogger } from "../utils/debug-logger.js";
import { LlmFactory, BrowserFactory } from "./factory";
import { click, type, scroll, goBack, wait, navigate } from "./tools.js";
import {
  INITIAL_AGENT_PROMPT,
  WEB_BROWSING_AGENT_PROMPT,
  SCREENSHOT_OBSERVATION_TEXT,
} from "./prompts.js";

const DEBUG_MODE = process.env.DEBUG_AGENT === "true";
let debugLogger: DebugLogger | null = null;

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

  if (DEBUG_MODE && !debugLogger) {
    const threadId = state.input || "unknown";
    debugLogger = new DebugLogger(threadId);
  }

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

  if (DEBUG_MODE && debugLogger) {
    console.log(`Debug session complete: ${debugLogger.getSessionPath()}`);
    console.log(`Total iterations: ${debugLogger.getIterationCount()}`);
    debugLogger = null;
  }

  return {
    ...state,
    img: undefined,
    interactiveElements: [],
    credentials: undefined,
  };
}

export async function ensurePageNode(state: AgentStateType) {
  const page = await BrowserFactory.getPage();

  try {
    await page.waitForLoadState("load", { timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 5000 });
  } catch (error) {
    console.log("Page load timeout, continuing anyway");
  }

  return {
    ...state,
    page,
  };
}

export async function labelElementsNode(state: AgentStateType) {
  const page = state.page?.evaluate
    ? state.page
    : await BrowserFactory.getPage();
  const interactiveElements = await getInteractiveElements(page);
  await labelElements(page, interactiveElements);
  return {
    ...state,
    interactiveElements,
  };
}

export async function captureScreenshotNode(state: AgentStateType) {
  const page = state.page?.screenshot
    ? state.page
    : await BrowserFactory.getPage();
  const screenshot = await page.screenshot();
  const base64Image = screenshot.toString("base64");

  if (DEBUG_MODE && debugLogger) {
    try {
      const url = await page.url();
      debugLogger.saveIteration({
        screenshot: base64Image,
        elements: state.interactiveElements || [],
        url,
        metadata: {
          llmCalls: state.llmCalls || 0,
          messageCount: state.messages.length,
        },
      });
    } catch (error) {
      console.error("Error saving debug iteration:", error);
    }
  }

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
    let screenshotText = SCREENSHOT_OBSERVATION_TEXT;

    if (state.credentials) {
      screenshotText += `\n\nLOGIN CREDENTIALS PROVIDED:\n- Username/Email: ${state.credentials.username}\n- Password: ${state.credentials.password}\n\nYou must fill in the login form with these credentials using the type tool.`;
    }

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
            text: screenshotText,
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
