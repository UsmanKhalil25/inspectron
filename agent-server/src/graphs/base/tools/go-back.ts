import { tool } from "@langchain/core/tools";
import * as z from "zod";

import type { ToolState } from "./types";
import { BrowserManager } from "../../../libs";

export const goBack = (_state: ToolState) =>
  tool(
    async () => {
      const page = await BrowserManager.getPage();
      if (!page) {
        return "Error: Browser page not available";
      }
      await page.goBack();
      return "Navigated back to the previous page";
    },
    {
      name: "goBack",
      description: "Navigate back to the previous page in browser history",
      schema: z.object({}),
    },
  );
