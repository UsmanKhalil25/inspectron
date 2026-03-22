import { tool } from "@langchain/core/tools";
import * as z from "zod";

import type { MainStateType } from "../state";

const DEFAULT_WAIT_MS = 500;

export const click = (state: MainStateType) =>
  tool(
    async ({ elementId }) => {
      const page = state.page;
      if (!page) {
        return "Error: Browser page not available";
      }
      const interactiveElements = state.interactiveElements || [];

      const element = interactiveElements.find((el) => el.id === elementId);
      if (!element) {
        return `Error: no element with id ${elementId}`;
      }

      const { x, y, width, height } = element.boundingBox;
      await page.mouse.click(x + width / 2, y + height / 2);
      await page.waitForTimeout(DEFAULT_WAIT_MS);
      return `Clicked element ${elementId} (<${element.tag}>${element.text ? `: "${element.text}"` : ""})`;
    },
    {
      name: "click",
      description:
        "Click on a button, link, or interactive element. Use to submit forms, follow links, or activate buttons. After clicking, you will receive a fresh screenshot.",
      schema: z.object({
        elementId: z
          .number()
          .describe(
            "The numeric ID from the screenshot label (top-left corner of the element)",
          ),
      }),
    },
  );
