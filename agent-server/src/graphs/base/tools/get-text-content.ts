import { tool } from "@langchain/core/tools";
import * as z from "zod";

import type { ToolState } from "./types";

export const getText = (state: ToolState) =>
  tool(
    async () => {
      const page = state.page;
      if (!page) {
        return "Error: Browser page not available";
      }

      const text = await page.evaluate(() => document.body.innerText);
      const url = page.url();

      return `URL: ${url}\n\n${text.trim()}`;
    },
    {
      name: "getText",
      description:
        "Extract all visible text content from the current page. Use this to read page content that is not fully visible in the screenshot, inspect page text for security-relevant information, or understand the full structure of a page.",
      schema: z.object({}),
    },
  );
