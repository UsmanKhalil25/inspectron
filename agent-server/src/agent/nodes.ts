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
import { click, type, scroll, goBack, wait, navigate, scanVulnerabilities } from "./tools.js";
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

  // Hard stop if crawl goal is reached
  if (state.crawlGoal) {
    const { currentPageCount, targetPageCount } = state.crawlGoal;
    if (currentPageCount >= targetPageCount) {
      console.log(`[Crawl Goal] Target reached: ${currentPageCount}/${targetPageCount} pages. Stopping execution.`);
      return END;
    }
  }

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

  // Track visited URLs
  const currentUrl = page.url();
  const visitedUrls = state.visitedUrls || [];

  // Add current URL if not already visited
  if (!visitedUrls.includes(currentUrl)) {
    visitedUrls.push(currentUrl);
    console.log(`[URL Tracker] Visited page ${visitedUrls.length}: ${currentUrl}`);
  }

  // Update crawl goal progress if it exists
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

export async function shouldRunLoginHandler(state: AgentStateType) {
  // Skip if login is already completed
  if (state.loginCompleted) {
    console.log("[Should Run Login Handler] Login completed - skipping");
    return "skip_login";
  }

  // Skip if we already have credentials (waiting for agent to fill form)
  if (state.credentials) {
    console.log("[Should Run Login Handler] Credentials already provided - skipping (agent will fill form)");
    return "skip_login";
  }

  // Only run login handler if we have no credentials and no completion
  console.log("[Should Run Login Handler] No credentials yet - running login handler");
  return "check_login";
}

export async function checkLoginCompletionNode(state: AgentStateType) {
  // Only check if we have credentials but haven't completed login
  if (!state.credentials || state.loginCompleted) {
    return { ...state };
  }

  const page = await BrowserFactory.getPage();
  const currentUrl = page.url();
  const loginUrl = state.loginUrl;

  // Method 1: If we had a login URL and we're now on a different URL, login succeeded
  if (loginUrl && currentUrl !== loginUrl) {
    console.log(`[Login Completion Check] URL changed from ${loginUrl} to ${currentUrl} - login completed`);
    return {
      ...state,
      loginCompleted: true,
    };
  }

  // Method 2: Check if login form is no longer present
  const loginStillPresent = await page.evaluate(() => {
    const passwordFields = document.querySelectorAll('input[type="password"]');
    return passwordFields.length > 0;
  });

  if (!loginStillPresent) {
    console.log("[Login Completion Check] Login form no longer present - login completed");
    return {
      ...state,
      loginCompleted: true,
    };
  }

  // Method 3: Check for common success indicators
  const loginSuccess = await page.evaluate(() => {
    const bodyText = document.body.innerText.toLowerCase();
    const successIndicators = [
      'welcome',
      'dashboard',
      'logout',
      'sign out',
      'my account',
      'profile'
    ];
    return successIndicators.some(indicator => bodyText.includes(indicator));
  });

  if (loginSuccess) {
    console.log("[Login Completion Check] Success indicators found on page - login completed");
    return {
      ...state,
      loginCompleted: true,
    };
  }

  console.log("[Login Completion Check] Login not yet complete, form may still be present");
  return { ...state };
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

  // Parse user input to detect crawl goals
  let crawlGoal = state.crawlGoal;

  if (state.input) {
    const userInput = state.input.toLowerCase();

    // Check if user specified a page count (e.g., "crawl 5 pages", "visit at least 10 pages")
    const crawlMatch = userInput.match(/(?:crawl|visit|explore).*?(?:at least|atleast)?\s*(\d+)\s*pages?/i);
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

export async function llmCallNode(state: AgentStateType) {
  // Check if crawl goal is already reached - force agent to respond directly
  if (state.crawlGoal) {
    const { currentPageCount, targetPageCount } = state.crawlGoal;
    if (currentPageCount >= targetPageCount) {
      console.log(`[Crawl Goal] Target reached before LLM call: ${currentPageCount}/${targetPageCount} pages.`);

      const model = LlmFactory.getLLM();
      const forceStopMessage = new SystemMessage(
        `STOP: You have successfully visited ${currentPageCount} pages, meeting the crawl goal of ${targetPageCount} pages. ` +
        `Do NOT use any tools. Respond directly to the user with a summary of your crawl, including the pages you visited.`
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
    type(state),
    scroll(state),
    wait(state),
    goBack(state),
    navigate(state),
    scanVulnerabilities(state),
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

    // Add visited URLs tracking information
    if (state.visitedUrls && state.visitedUrls.length > 0) {
      screenshotText += `\n\nVISITED URLS (${state.visitedUrls.length}):\n${state.visitedUrls.map((url, i) => `${i + 1}. ${url}`).join('\n')}`;
      screenshotText += `\n\nIMPORTANT: You have already visited the above URLs. Do NOT navigate to or click links that lead to these pages again. Focus on discovering NEW pages.`;
    }

    // Add crawl goal progress if exists
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
    scan_vulnerabilities: scanVulnerabilities(state),
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
