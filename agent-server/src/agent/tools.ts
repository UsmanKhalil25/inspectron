import { tool } from "@langchain/core/tools";
import * as z from "zod";

import { AgentStateType } from "./state.js";

const DEFAULT_WAIT_MS = 500;
export const click = (state: AgentStateType) =>
  tool(
    async ({ elementId }) => {
      const page = state.page;
      const interactiveElements = state.interactiveElements || [];

      const element = interactiveElements.find((el) => el.id === elementId);
      if (!element) {
        return `Error: no element with id ${elementId}`;
      }

      const { x, y, width, height } = element.boundingBox;
      await page.mouse.click(x + width / 2, y + height / 2);
      await page.waitForTimeout(DEFAULT_WAIT_MS);
      return `Clicked element ${elementId}`;
    },
    {
      name: "click",
      description: "Click on a labeled element by its ID number",
      schema: z.object({
        elementId: z
          .number()
          .describe("The ID number of the labeled element to click"),
      }),
    },
  );

export const type = (state: AgentStateType) =>
  tool(
    async ({ elementId, text }) => {
      const page = state.page;
      const interactiveElements = state.interactiveElements || [];
      const element = interactiveElements.find((el) => el.id === elementId);
      if (!element) {
        return `Error: no element with id ${elementId}`;
      }

      const { x, y, width, height } = element.boundingBox;
      await page.mouse.click(x + width / 2, y + height / 2);
      const selectAll = process.platform === "darwin" ? "Meta+A" : "Control+A";
      await page.keyboard.press(selectAll);
      await page.keyboard.press("Backspace");
      await page.keyboard.type(text);
      await page.keyboard.press("Enter");
      await page.waitForTimeout(DEFAULT_WAIT_MS);
      return `Typed "${text}" into element ${elementId} and submitted`;
    },
    {
      name: "type",
      description: "Type text into a labeled input element",
      schema: z.object({
        elementId: z
          .number()
          .describe("The ID number of the labeled input element"),
        text: z.string().describe("The text to type"),
      }),
    },
  );

export const scroll = (state: AgentStateType) =>
  tool(
    async ({ direction, amount = 500 }) => {
      const page = state.page;
      let deltaX = 0;
      let deltaY = 0;

      switch (direction) {
        case "up":
          deltaY = -amount;
          break;
        case "down":
          deltaY = amount;
          break;
        case "left":
          deltaX = -amount;
          break;
        case "right":
          deltaX = amount;
          break;
      }

      await page.mouse.wheel(deltaX, deltaY);
      await page.waitForTimeout(DEFAULT_WAIT_MS);
      return `Scrolled ${direction} by ${amount} pixels`;
    },
    {
      name: "scroll",
      description: "Scroll the page in a given direction",
      schema: z.object({
        direction: z
          .enum(["up", "down", "left", "right"])
          .describe("Direction to scroll"),
        amount: z
          .number()
          .optional()
          .describe("Amount to scroll in pixels (default: 500)"),
      }),
    },
  );

export const navigate = (state: AgentStateType) =>
  tool(
    async ({ url }) => {
      const page = state.page;
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(DEFAULT_WAIT_MS);
      return `Navigated to ${url}`;
    },
    {
      name: "navigate",
      description: "Navigate to a specified URL",
      schema: z.object({
        url: z.string().describe("The URL to navigate to"),
      }),
    },
  );

export const wait = (state: AgentStateType) =>
  tool(
    async ({ milliseconds }) => {
      const page = state.page;
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(milliseconds);

      return `Waited for ${milliseconds}ms`;
    },
    {
      name: "wait",
      description: "Wait for a specified amount of time in milliseconds",
      schema: z.object({
        milliseconds: z.number().describe("Time to wait in milliseconds"),
      }),
    },
  );

export const goBack = (state: AgentStateType) =>
  tool(
    async () => {
      const page = state.page;
      await page.goBack();
      return "Navigated back to the previous page";
    },
    {
      name: "go_back",
      description: "Navigate back to the previous page in browser history",
      schema: z.object({}),
    },
  );
