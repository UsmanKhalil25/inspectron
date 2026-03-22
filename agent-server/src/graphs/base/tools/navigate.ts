import { tool } from "@langchain/core/tools";
import * as z from "zod";

import type { MainStateType } from "../state";

const DEFAULT_WAIT_MS = 500;

export const navigate = (state: MainStateType) =>
  tool(
    async ({ url }) => {
      const page = state.page;
      if (!page) {
        return "Error: Browser page not available";
      }

      // Ensure URL has protocol
      const fullUrl = url.startsWith("http") ? url : `https://${url}`;
      await page.goto(fullUrl, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(DEFAULT_WAIT_MS);
      return `Navigated to ${fullUrl}. Now look at the screenshot to see what's on the page.`;
    },
    {
      name: "navigate",
      description:
        "Navigate to a website URL. Use ONCE at the beginning. After navigating, examine the screenshot before taking further actions.",
      schema: z.object({
        url: z
          .string()
          .describe("The URL (e.g., 'google.com' or 'https://example.com')"),
      }),
    },
  );
