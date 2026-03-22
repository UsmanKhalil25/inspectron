import { tool } from "@langchain/core/tools";
import * as z from "zod";

import type { MainStateType } from "../state";

const DEFAULT_WAIT_MS = 500;

export const scroll = (state: MainStateType) =>
  tool(
    async ({ direction, amount = 500 }) => {
      const page = state.page;
      if (!page) {
        return "Error: Browser page not available";
      }
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
