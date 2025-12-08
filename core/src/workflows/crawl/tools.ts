import { tool } from "@langchain/core/tools";
import { z } from "zod";

import { BrowserService } from "../../services/browser-service";
import { PageElement } from "../../types";

export const clickTool = (
  browserService: BrowserService,
  elements: PageElement[],
) =>
  tool(
    async ({ element_id }: { element_id: number }) => {
      console.log(JSON.stringify({ tool: "click", args: { element_id } }));
      const element = elements.find((el) => el.id === element_id);
      if (!element) {
        return `Error: no element with id ${element_id}`;
      }
      const page = browserService.getPage();
      const { x, y, width, height } = element.boundingBox;
      await page.mouse.click(x + width / 2, y + height / 2);
      return `Clicked element ${element_id}`;
    },
    {
      name: "click",
      description: "Click on an element identified by its labeled box number",
      schema: z.object({
        element_id: z
          .number()
          .describe("Numerical label of the element to click"),
      }),
    },
  );

export const typeTool = (
  browserService: BrowserService,
  elements: PageElement[],
) =>
  tool(
    async ({ element_id, text }: { element_id: number; text: string }) => {
      const element = elements.find((el) => el.id === element_id);
      if (!element) {
        return `Error: no element with id ${element_id}`;
      }
      const page = browserService.getPage();
      const { x, y, width, height } = element.boundingBox;
      await page.mouse.click(x + width / 2, y + height / 2);
      const selectAll = process.platform === "darwin" ? "Meta+A" : "Control+A";
      await page.keyboard.press(selectAll);
      await page.keyboard.press("Backspace");
      await page.keyboard.type(text);
      await page.keyboard.press("Enter");
      return `Typed "${text}" into element ${element_id} and submitted`;
    },
    {
      name: "type",
      description: "Type text into an input field at a labeled box and submit",
      schema: z.object({
        element_id: z.number().describe("Numerical label of the input element"),
        text: z.string().describe("The text to type"),
      }),
    },
  );

export const scrollTool = (
  browserService: BrowserService,
  elements: PageElement[],
) =>
  tool(
    async ({
      target,
      direction,
    }: {
      target: string | number;
      direction: string;
    }) => {
      console.log(
        JSON.stringify({ tool: "scroll", args: { target, direction } }),
      );
      const page = browserService.getPage();
      if (typeof target === "string" && target.toUpperCase() === "WINDOW") {
        const scrollAmount = 500;
        const scrollDirection =
          direction.toLowerCase() === "up" ? -scrollAmount : scrollAmount;
        await page.evaluate(`window.scrollBy(0, ${scrollDirection})`);
        return `Scrolled ${direction} in window`;
      } else {
        const scrollAmount = 200;
        const targetId = typeof target === "number" ? target : parseInt(target);
        const element = elements.find((el) => el.id === targetId);
        if (!element) {
          return `Error: no element with id ${targetId}`;
        }
        const { x, y } = element.boundingBox;
        const scrollDirection =
          direction.toLowerCase() === "up" ? -scrollAmount : scrollAmount;
        await page.mouse.move(x, y);
        await page.mouse.wheel(0, scrollDirection);
        return `Scrolled ${direction} in element ${targetId}`;
      }
    },
    {
      name: "scroll",
      description: "Scroll the page or an element in a specified direction",
      schema: z.object({
        target: z
          .union([z.literal("WINDOW"), z.number()])
          .describe('Target to scroll: "WINDOW" or numerical label of element'),
        direction: z.enum(["up", "down"]).describe("Direction to scroll"),
      }),
    },
  );

export const waitTool = (browserService: BrowserService) =>
  tool(
    async () => {
      const sleepTime = 5;
      await new Promise((resolve) => setTimeout(resolve, sleepTime * 1000));
      return `Waited for ${sleepTime}s`;
    },
    {
      name: "wait",
      description: "Wait for 5 seconds",
      schema: z.object({}),
    },
  );

export const goBackTool = (browserService: BrowserService) =>
  tool(
    async () => {
      const page = browserService.getPage();
      await page.goBack();
      return `Navigated back to ${page.url}`;
    },
    {
      name: "go_back",
      description: "Navigate back to the previous page",
      schema: z.object({}),
    },
  );
