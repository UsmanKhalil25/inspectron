import { SystemMessage, HumanMessage } from "@langchain/core/messages";

import { MainStateType } from "../state";
import { click, typeText, scroll, navigate, wait, goBack } from "../tools";

import { LlmFactory } from "../../../clients/llm";
import {
  SCREENSHOT_OBSERVATION_TEXT,
  WEB_BROWSING_AGENT_PROMPT,
} from "../prompts";
import { createAgent } from "../../../libs";
import { loadImage } from "../../../libs/utils";

const DO_NOT_RENDER_PREFIX = "do-not-render-";

export async function agentNode(state: MainStateType) {
  if (!state.currentScreenshotPath) {
    throw new Error("Screenshot path not found in state");
  }

  const currentScreenshot = await loadImage(state.currentScreenshotPath);

  const tools = [
    click(state),
    typeText(state),
    scroll(state),
    navigate(state),
    wait(state),
    goBack(state),
  ];

  const agent = createAgent(LlmFactory.getLLM(), tools, {
    tags: ["langsmith:nostream"],
  });

  const screenshotMessage = new HumanMessage({
    id: `${DO_NOT_RENDER_PREFIX}screenshot`,
    content: [
      {
        type: "image_url",
        image_url: {
          url: `data:image/png;base64,${currentScreenshot.toString("base64")}`,
        },
      },
      { type: "text", text: SCREENSHOT_OBSERVATION_TEXT },
    ],
  });

  const messages = [
    new SystemMessage({
      content: WEB_BROWSING_AGENT_PROMPT,
      id: `${DO_NOT_RENDER_PREFIX}system-prompt`,
    }),
    ...state.messages,
    screenshotMessage,
  ];

  const result = await agent.invoke({ messages });

  return {
    messages: result.messages.slice(messages.length),
  };
}
