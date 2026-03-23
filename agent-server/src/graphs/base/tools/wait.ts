import { tool } from "@langchain/core/tools";
import * as z from "zod";

import type { MainStateType } from "../state";

export const wait = (state: MainStateType) =>
  tool(
    async ({ milliseconds }) => {
      const page = state.page;
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
