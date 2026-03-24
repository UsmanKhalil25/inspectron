import { z } from "zod";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

import { LlmFactory } from "../../../clients/llm";
import { loadImage } from "../../../libs/utils";
import { MAIN_AGENT_PROMPT } from "../prompts";
import type { MainGraphStateType } from "../state";

const MainAgentDecisionSchema = z.object({
  action: z.enum(["continue", "complete"]),
  instruction: z.string(),
  reason: z.string(),
});

export async function mainAgentNode(state: MainGraphStateType) {
  if (!state.currentScreenshotPath) {
    throw new Error("Screenshot path not found in state");
  }

  const currentScreenshot = await loadImage(state.currentScreenshotPath);

  const model = LlmFactory.getLLM().withStructuredOutput(MainAgentDecisionSchema);

  const messages = [
    new SystemMessage(MAIN_AGENT_PROMPT),
    new HumanMessage({
      content: [
        {
          type: "text",
          text: `User task: ${state.userInput}`,
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
    mainAgentAction: result.action,
    browserInstruction: result.instruction,
  };
}
