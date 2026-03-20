import type { Page } from "playwright";

import type { PageElement } from "../../schemas/page-elements";
import {
  SystemMessage,
  AIMessage,
  HumanMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { END } from "@langchain/langgraph";

import type { AgentStateType } from "./state";
import { labelElements } from "../../utils/label-elements";
import { DebugLogger } from "../../utils/debug-logger";
import { LlmFactory } from "../../clients/llm/factory";
import { BrowserManager } from "../../libs";
import { click, type_, scroll, goBack, wait, navigate } from "./tools";
import {
  INITIAL_AGENT_PROMPT,
  WEB_BROWSING_AGENT_PROMPT,
  SCREENSHOT_OBSERVATION_TEXT,
} from "./prompts";
import { stringEnv } from "../../utils/config";

const DEBUG_MODE = stringEnv("DEBUG_AGENT", "false") === "true";
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

export async function openBrowserNode(state: AgentStateType) {
  await BrowserManager.launch();
  const page = await BrowserManager.getPage();

  if (DEBUG_MODE && !debugLogger) {
    const threadId = state.input || "unknown";
    debugLogger = new DebugLogger(threadId);
  }

  return {
    ...state,
    page,
  };
}

export function shouldContinue(state: AgentStateType) {
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage == null || !AIMessage.isInstance(lastMessage)) return END;

  if (state.crawlGoal) {
    const { currentPageCount, targetPageCount } = state.crawlGoal;
    if (currentPageCount >= targetPageCount) {
      console.log(
        `[Crawl Goal] Target reached: ${currentPageCount}/${targetPageCount} pages. Stopping execution.`,
      );
      return END;
    }
  }

  if (lastMessage.tool_calls?.length) {
    return "runTools";
  }

  return END;
}

export function shouldInitializeBrowser(state: AgentStateType) {
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage == null || !AIMessage.isInstance(lastMessage)) return END;

  if (lastMessage.tool_calls?.length) {
    return "initialization";
  }

  return END;
}

export async function closeBrowserNode(state: AgentStateType) {
  await BrowserManager.cleanup();

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

export async function syncPageNode(state: AgentStateType) {
  const page = await BrowserManager.getPage();

  try {
    await page.waitForLoadState("load", { timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 5000 });
  } catch {
    console.log("Page load timeout, continuing anyway");
  }

  const currentUrl = page.url();
  const visitedUrls = state.visitedUrls || [];

  if (!visitedUrls.includes(currentUrl)) {
    visitedUrls.push(currentUrl);
    console.log(
      `[URL Tracker] Visited page ${visitedUrls.length}: ${currentUrl}`,
    );
  }

  const crawlGoal = state.crawlGoal
    ? {
        ...state.crawlGoal,
        currentPageCount: visitedUrls.length,
      }
    : undefined;

  return {
    ...state,
    page,
    visitedUrls,
    crawlGoal,
  };
}

export function shouldRunLoginHandler(state: AgentStateType) {
  if (state.loginCompleted) {
    console.log("[Should Run Login Handler] Login completed - skipping");
    return "skip_login";
  }

  if (state.credentials) {
    console.log(
      "[Should Run Login Handler] Credentials already provided - skipping (agent will fill form)",
    );
    return "skip_login";
  }

  console.log(
    "[Should Run Login Handler] No credentials yet - running login handler",
  );
  return "check_login";
}

export async function detectLoginNode(state: AgentStateType) {
  if (!state.credentials || state.loginCompleted) {
    return { ...state };
  }

  const page = await BrowserManager.getPage();
  const currentUrl = page.url();
  const loginUrl = state.loginUrl;

  if (loginUrl && currentUrl !== loginUrl) {
    console.log(
      `[Login Completion Check] URL changed from ${loginUrl} to ${currentUrl} - login completed`,
    );
    return {
      ...state,
      loginCompleted: true,
    };
  }

  const loginStillPresent = await page.evaluate(() => {
    const passwordFields = document.querySelectorAll('input[type="password"]');
    return passwordFields.length > 0;
  });

  if (!loginStillPresent) {
    console.log(
      "[Login Completion Check] Login form no longer present - login completed",
    );
    return {
      ...state,
      loginCompleted: true,
    };
  }

  const loginSuccess = await page.evaluate(() => {
    const bodyText = document.body.innerText.toLowerCase();
    const successIndicators = [
      "welcome",
      "dashboard",
      "logout",
      "sign out",
      "my account",
      "profile",
    ];
    return successIndicators.some((indicator) => bodyText.includes(indicator));
  });

  if (loginSuccess) {
    console.log(
      "[Login Completion Check] Success indicators found on page - login completed",
    );
    return {
      ...state,
      loginCompleted: true,
    };
  }

  console.log(
    "[Login Completion Check] Login not yet complete, form may still be present",
  );
  return { ...state };
}

export async function labelElementsNode(state: AgentStateType) {
  const page = state.page ? state.page : await BrowserManager.getPage();
  const interactiveElements = await getInteractiveElements(page);
  await labelElements(page, interactiveElements);
  return {
    ...state,
    interactiveElements,
  };
}

export async function screenshotNode(state: AgentStateType) {
  const page = state.page ? state.page : await BrowserManager.getPage();
  const screenshot = await page.screenshot();
  const base64Image = screenshot.toString("base64");

  if (DEBUG_MODE && debugLogger) {
    try {
      const url = page.url();
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

export async function initialPlanNode(state: AgentStateType) {
  const model = LlmFactory.getLLM();

  const tools = [navigate(state)];
  const modelWithTools = model.bindTools(tools);

  const messages = [new SystemMessage(INITIAL_AGENT_PROMPT), ...state.messages];

  let crawlGoal = state.crawlGoal;

  if (state.input) {
    const userInput = state.input.toLowerCase();
    const crawlMatch = userInput.match(
      /(?:crawl|visit|explore).*?(?:at least|atleast)?\s*(\d+)\s*pages?/i,
    );
    if (crawlMatch) {
      const targetPageCount = parseInt(crawlMatch[1], 10);
      crawlGoal = {
        targetPageCount,
        currentPageCount: 0,
      };
      console.log(`[Crawl Goal] Target: ${targetPageCount} pages`);
    }
  }

  return {
    messages: await modelWithTools.invoke(messages),
    llmCalls: (state.llmCalls ?? 0) + 1,
    crawlGoal,
    visitedUrls: state.visitedUrls || [],
  };
}

export async function reasonNode(state: AgentStateType) {
  if (state.crawlGoal) {
    const { currentPageCount, targetPageCount } = state.crawlGoal;
    if (currentPageCount >= targetPageCount) {
      console.log(
        `[Crawl Goal] Target reached before LLM call: ${currentPageCount}/${targetPageCount} pages.`,
      );

      const model = LlmFactory.getLLM();
      const forceStopMessage = new SystemMessage(
        `STOP: You have successfully visited ${currentPageCount} pages, meeting the crawl goal of ${targetPageCount} pages. ` +
          `Do NOT use any tools. Respond directly to the user with a summary of your crawl, including the pages you visited.`,
      );

      return {
        messages: await model.invoke([forceStopMessage, ...state.messages]),
        llmCalls: (state.llmCalls ?? 0) + 1,
      };
    }
  }

  const model = LlmFactory.getLLM();
  const tools = [
    click(state),
    type_(state),
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

    if (state.visitedUrls && state.visitedUrls.length > 0) {
      screenshotText += `\n\nVISITED URLS (${state.visitedUrls.length}):\n${state.visitedUrls.map((url, i) => `${i + 1}. ${url}`).join("\n")}`;
      screenshotText += `\n\nIMPORTANT: You have already visited the above URLs. Do NOT navigate to or click links that lead to these pages again. Focus on discovering NEW pages.`;
    }

    if (state.crawlGoal) {
      screenshotText += `\n\nCRAWL PROGRESS: ${state.crawlGoal.currentPageCount} / ${state.crawlGoal.targetPageCount} pages visited`;
      if (state.crawlGoal.currentPageCount >= state.crawlGoal.targetPageCount) {
        screenshotText += `\n⚠️ TARGET REACHED: You have visited the required number of pages. Complete your task and respond directly.`;
      }
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

export async function runToolsNode(state: AgentStateType) {
  const lastMessage = state.messages[state.messages.length - 1];

  if (lastMessage == null || !AIMessage.isInstance(lastMessage)) {
    return { messages: [] };
  }

  const toolsByName = {
    click: click(state),
    type: type_(state),
    scroll: scroll(state),
    wait: wait(state),
    go_back: goBack(state),
    navigate: navigate(state),
  };

  const result: ToolMessage[] = [];
  for (const toolCall of lastMessage.tool_calls ?? []) {
    const toolName = toolCall.name as keyof typeof toolsByName;
    const tool = toolsByName[toolName];
    if (tool) {
      const observation = await (
        tool as unknown as { invoke: (arg: unknown) => Promise<ToolMessage> }
      ).invoke(toolCall);
      result.push(observation);
    }
  }

  return { messages: result };
}
