import { tool } from "@langchain/core/tools";
import * as z from "zod";
import type { Page } from "playwright";

import { BrowserFactory } from "./factory/index.js";

const click = tool(
  async ({ elementId }) => {
    const page = await BrowserFactory.getPage();

    await page.evaluate((id) => {
      const label = document.querySelector(`[data-label-id="${id}"]`);
      if (!label) {
        throw new Error(`Element with label ID ${id} not found`);
      }

      const rect = label.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const element = document.elementFromPoint(centerX, centerY);
      if (element && element instanceof HTMLElement) {
        element.click();
      } else {
        throw new Error(`No clickable element found at label ${id}`);
      }
    }, elementId);

    return `Clicked on element with ID ${elementId}`;
  },
  {
    name: "click",
    description: "Click on a labeled element by its ID number",
    schema: z.object({
      elementId: z.number().describe("The ID number of the labeled element to click"),
    }),
  }
);

const type = tool(
  async ({ elementId, text }) => {
    const page = await BrowserFactory.getPage();

    await page.evaluate((id) => {
      const label = document.querySelector(`[data-label-id="${id}"]`);
      if (!label) {
        throw new Error(`Element with label ID ${id} not found`);
      }

      const rect = label.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const element = document.elementFromPoint(centerX, centerY);
      if (element && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
        element.focus();
      } else {
        throw new Error(`Element with label ${id} is not an input or textarea`);
      }
    }, elementId);

    await page.keyboard.type(text);

    return `Typed "${text}" into element with ID ${elementId}`;
  },
  {
    name: "type",
    description: "Type text into a labeled input element",
    schema: z.object({
      elementId: z.number().describe("The ID number of the labeled input element"),
      text: z.string().describe("The text to type"),
    }),
  }
);

const scroll = tool(
  async ({ direction, amount }) => {
    const page = await BrowserFactory.getPage();

    const scrollAmount = amount || 500;
    const scrollX = direction === "left" ? -scrollAmount : direction === "right" ? scrollAmount : 0;
    const scrollY = direction === "up" ? -scrollAmount : direction === "down" ? scrollAmount : 0;

    await page.evaluate(({ x, y }) => {
      window.scrollBy(x, y);
    }, { x: scrollX, y: scrollY });

    return `Scrolled ${direction} by ${scrollAmount}px`;
  },
  {
    name: "scroll",
    description: "Scroll the page in a given direction",
    schema: z.object({
      direction: z.enum(["up", "down", "left", "right"]).describe("Direction to scroll"),
      amount: z.number().optional().describe("Amount to scroll in pixels (default: 500)"),
    }),
  }
);

const wait = tool(
  async ({ milliseconds }) => {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
    return `Waited for ${milliseconds}ms`;
  },
  {
    name: "wait",
    description: "Wait for a specified amount of time in milliseconds",
    schema: z.object({
      milliseconds: z.number().describe("Time to wait in milliseconds"),
    }),
  }
);

const goBack = tool(
  async () => {
    const page = await BrowserFactory.getPage();
    await page.goBack();
    return "Navigated back to previous page";
  },
  {
    name: "go_back",
    description: "Navigate back to the previous page in browser history",
    schema: z.object({}),
  }
);

export const toolsByName = {
  [click.name]: click,
  [type.name]: type,
  [scroll.name]: scroll,
  [wait.name]: wait,
  [goBack.name]: goBack,
};

export const tools = Object.values(toolsByName);
