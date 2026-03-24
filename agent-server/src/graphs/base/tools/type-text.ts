import { tool } from "@langchain/core/tools";
import * as z from "zod";

import type { ToolState } from "./types";
import { BrowserManager } from "../../../libs";

const DEFAULT_WAIT_MS = 500;

export const typeText = (state: ToolState) =>
  tool(
    async ({ elementId, text }) => {
      const page = await BrowserManager.getPage();
      if (!page) {
        return "Error: Browser page not available";
      }
      const interactiveElements = state.interactiveElements || [];
      const element = interactiveElements.find((el) => el.id === elementId);
      if (!element) {
        return `Error: no element with id ${elementId}`;
      }

      const { x, y, width, height } = element.boundingBox;

      // First click to activate/focus the input field
      await page.mouse.click(x + width / 2, y + height / 2);
      await page.waitForTimeout(100);

      // Select all and clear existing text
      const selectAll = process.platform === "darwin" ? "Meta+A" : "Control+A";
      await page.keyboard.press(selectAll);
      await page.waitForTimeout(50);
      await page.keyboard.press("Backspace");
      await page.waitForTimeout(50);

      // Type the new text
      await page.keyboard.type(text, { delay: 10 });
      await page.waitForTimeout(DEFAULT_WAIT_MS);

      return `Clicked to activate, then typed "${text}" into element ${elementId} (<${element.tag}>)`;
    },
    {
      name: "typeText",
      description:
        "Type text into an input field. First clicks the field to activate it, clears any existing text, then types. Use this ONCE per field.",
      schema: z.object({
        elementId: z
          .number()
          .describe(
            "The numeric ID from the screenshot label (top-left corner of the input field)",
          ),
        text: z.string().describe("The text to type into the field"),
      }),
    },
  );
