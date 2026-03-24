import { z } from "zod";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

import { LlmFactory } from "../../../clients/llm";
import { loadImage } from "../../../libs/utils";
import { BrowserManager } from "../../../libs";
import { MAIN_AGENT_PROMPT } from "../prompts";
import type { MainGraphStateType } from "../state";

const MainAgentDecisionSchema = z.object({
  nextNode: z.enum([
    "browser_agent",
    "close_browser",
    // "captcha_handler",
    "input_handler",
  ]),
  instruction: z.string().default(""),
  reason: z.string(),
  inputHandlerElementId: z.number().nullable().default(null),
  inputHandlerFieldType: z.enum(["text", "password"]).nullable().default(null),
  inputHandlerInstruction: z.string().nullable().default(null),
});

export async function mainAgentNode(state: MainGraphStateType) {
  if (!state.currentScreenshotPath) {
    throw new Error("Screenshot path not found in state");
  }

  const currentScreenshot = await loadImage(state.currentScreenshotPath);
  
  // Get current URL and key page elements from browser
  const page = await BrowserManager.getPage();
  const currentUrl = page.url();
  
  // Extract only essential page elements (headings, buttons, inputs, labels)
  const pageSummary = await page.evaluate(() => {
    const elements: string[] = [];
    
    // Get page title and main heading
    const title = document.title;
    if (title) elements.push(`Title: ${title}`);
    
    // Get h1, h2 headings (max 3)
    const headings = Array.from(document.querySelectorAll('h1, h2')).slice(0, 3);
    headings.forEach(h => elements.push(`${h.tagName}: ${h.textContent?.trim()}`));
    
    // Get button text (max 5)
    const buttons = Array.from(document.querySelectorAll('button, [role="button"], input[type="submit"]')).slice(0, 5);
    buttons.forEach(b => {
      const text = b.textContent?.trim() || (b as HTMLInputElement).value;
      if (text) elements.push(`Button: ${text}`);
    });
    
    // Get input placeholders and labels (max 5)
    const inputs = Array.from(document.querySelectorAll('input, textarea')).slice(0, 5);
    inputs.forEach(input => {
      const placeholder = input.getAttribute('placeholder');
      const label = input.closest('label')?.textContent?.trim() || 
                   document.querySelector(`label[for="${input.id}"]`)?.textContent?.trim();
      const name = input.getAttribute('name') || input.getAttribute('aria-label');
      if (placeholder || label || name) {
        elements.push(`Input: ${placeholder || label || name} (${input.getAttribute('type') || 'text'})`);
      }
    });
    
    // Get any error messages
    const errors = Array.from(document.querySelectorAll('[role="alert"], .error, .alert, [class*="error" i]')).slice(0, 2);
    errors.forEach(e => elements.push(`Error: ${e.textContent?.trim()}`));
    
    return elements.join('\n');
  });

  const model = LlmFactory.getLLM().withStructuredOutput(
    MainAgentDecisionSchema,
  );

  // Build structured context message
  const contextText = `
=== CURRENT STATE ===

URL: ${currentUrl}

TASK: ${state.userInput}

PAGE SUMMARY:
${pageSummary}

=== END STATE ===`;

  const messages = [
    new SystemMessage(MAIN_AGENT_PROMPT),
    new HumanMessage({
      content: [
        {
          type: "text",
          text: contextText,
        },
        {
          type: "image_url",
          image_url: {
            url: `data:image/png;base64,${currentScreenshot.toString("base64")}`,
          },
        },
      ],
    }),
    ...(state.messages || []),
  ];

  const result = await model.invoke(messages);

  return {
    nextNode: result.nextNode,
    browserInstruction: result.instruction,
    inputHandlerElementId: result.inputHandlerElementId ?? undefined,
    inputHandlerFieldType: result.inputHandlerFieldType ?? undefined,
    inputHandlerInstruction: result.inputHandlerInstruction ?? undefined,
  };
}
