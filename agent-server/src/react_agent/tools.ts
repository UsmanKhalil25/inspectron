import { tool } from "@langchain/core/tools";
import { z } from "zod";

import { BrowserService, PageElement } from "core";

let browserInstance: BrowserService | null = null;
let elementsCache: PageElement[] = [];

async function ensureBrowser(): Promise<BrowserService> {
  if (!browserInstance) {
    browserInstance = new BrowserService();
    await browserInstance.launch();
  }
  return browserInstance;
}

async function getAllElements(): Promise<PageElement[]> {
  const browser = await ensureBrowser();
  const inputs = await browser.getInputs();
  const textareas = await browser.getTextareas();
  const selects = await browser.getSelects();
  const buttons = await browser.getButtons();
  const links = await browser.getLinks();

  const allElements = [
    ...inputs,
    ...textareas,
    ...selects,
    ...buttons,
    ...links,
  ];

  return allElements.map((el, index) => ({
    ...el,
    id: index + 1,
  }));
}

async function refreshElementsCache(): Promise<void> {
  elementsCache = await getAllElements();
}

function findElementById(id: number): PageElement | null {
  return elementsCache.find((el) => el.id === id) || null;
}

const navigateToUrlTool = tool(
  async ({ url }: { url: string }) => {
    const browser = await ensureBrowser();
    await browser.navigate(url);
    await refreshElementsCache();
    return `Navigated to ${url}`;
  },
  {
    name: "navigate_to_url",
    description: "Navigate browser to a URL and wait for page to load",
    schema: z.object({
      url: z
        .string()
        .describe(
          "The full URL to navigate to including protocol (e.g., https://example.com)",
        ),
    }),
  },
);

const waitForPageTool = tool(
  async ({ timeout_ms }: { timeout_ms?: number }) => {
    const browser = await ensureBrowser();
    await browser.wait(timeout_ms || 500);
    await refreshElementsCache();
    return `Page settled after waiting ${timeout_ms || 500}ms`;
  },
  {
    name: "wait_for_page",
    description: "Wait for page to settle after interactions",
    schema: z.object({
      timeout_ms: z
        .number()
        .optional()
        .describe(
          "Optional timeout in milliseconds to wait after network idle (default: 500)",
        ),
    }),
  },
);

const clickElementTool = tool(
  async ({ element_id }: { element_id: number }) => {
    const browser = await ensureBrowser();
    const element = findElementById(element_id);
    if (!element) {
      return `Element with ID ${element_id} not found. The page may have changed. Try waiting or navigating again.`;
    }
    await browser.clickElement(element);
    return `Clicked element with ID ${element_id}`;
  },
  {
    name: "click_element",
    description: "Click an element by its ID from the annotated screenshot",
    schema: z.object({
      element_id: z
        .number()
        .describe("The ID of the element to click (from annotated screenshot)"),
    }),
  },
);

const scrollPageTool = tool(
  async ({ amount }: { amount: number }) => {
    const browser = await ensureBrowser();
    await browser.scroll(amount);
    return `Scrolled page by ${amount} pixels`;
  },
  {
    name: "scroll_page",
    description: "Scroll the page vertically by amount in pixels",
    schema: z.object({
      amount: z
        .number()
        .describe(
          "Number of pixels to scroll vertically (positive for down, negative for up)",
        ),
    }),
  },
);

const typeIntoElementTool = tool(
  async ({ element_id, text }: { element_id: number; text: string }) => {
    const browser = await ensureBrowser();
    const element = findElementById(element_id);
    if (!element) {
      return `Element with ID ${element_id} not found. The page may have changed. Try waiting or navigating again.`;
    }
    await browser.typeIntoElement(element, text);
    return `Typed "${text}" into element with ID ${element_id}`;
  },
  {
    name: "type_into_element",
    description:
      "Type text into an input element by its ID from the annotated screenshot",
    schema: z.object({
      element_id: z
        .number()
        .describe(
          "The ID of the input element to type into (from annotated screenshot)",
        ),
      text: z.string().describe("The text to type into the element"),
    }),
  },
);

const getPageContentTool = tool(
  async () => {
    const browser = await ensureBrowser();
    const content = await browser.getPageContent();
    return `Page Title: ${content.title}\nURL: ${content.url}\n\nText Content:\n${content.text}`;
  },
  {
    name: "get_page_content",
    description: "Get the text content of the current page including title, URL, and all visible text",
    schema: z.object({}),
  },
);

const chatTool = tool(
  async ({ message }: { message: string }) => {
    return `Received message: "${message}". This is a simple chat tool responding to your message.`;
  },
  {
    name: "chat",
    description:
      "A simple chat tool for processing and responding to messages. Use this when you need to process or respond to user messages.",
    schema: z.object({
      message: z.string().describe("The message to process"),
    }),
  },
);

const getBrowserTools = () => [
  navigateToUrlTool,
  waitForPageTool,
  clickElementTool,
  scrollPageTool,
  typeIntoElementTool,
  getPageContentTool,
];

export const TOOLS = [chatTool, ...getBrowserTools()];
