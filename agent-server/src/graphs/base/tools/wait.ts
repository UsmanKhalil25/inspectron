import { tool } from "@langchain/core/tools";
import * as z from "zod";

import type { ToolState } from "./types";
import { BrowserManager } from "../../../libs";

export const wait = (_state: ToolState) =>
  tool(
    async ({ milliseconds }) => {
      const page = await BrowserManager.getPage();
      if (!page) {
        return "Error: Browser page not available";
      }
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
