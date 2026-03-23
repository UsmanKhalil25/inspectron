import { tool } from "@langchain/core/tools";
import * as z from "zod";

import type { MainStateType } from "../state";

const DEFAULT_WAIT_MS = 500;

export const goBack = (state: MainStateType) =>
  tool(
    async () => {
      const page = state.page;
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
