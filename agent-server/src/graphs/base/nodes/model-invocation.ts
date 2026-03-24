import { SystemMessage, HumanMessage } from "@langchain/core/messages";

import { LlmFactory } from "../../../clients/llm";
import { WEB_BROWSING_AGENT_PROMPT } from "../prompts";
import { loadImage } from "../../../libs/utils";
import {
  click,
  typeText,
  scroll,
  navigate,
  wait,
  goBack,
  getText,
} from "../tools";
import type { MainGraphStateType } from "../state";

export async function modelInvocation(state: MainGraphStateType) {
  if (!state.currentScreenshotPath) {
    throw new Error("Screenshot path not found in state");
  }

  const currentScreenshot = await loadImage(state.currentScreenshotPath);
  const page = state.page;

  if (!page) {
    throw new Error("Page not found in state");
  }

  const model = LlmFactory.getLLM();
  const tools = [
    click(state),
    typeText(state),
    scroll(state),
    navigate(state),
    wait(state),
    goBack(state),
    getText(state),
  ];
  const modelWithTools = model.bindTools(tools);

  const messages = [
    new SystemMessage(WEB_BROWSING_AGENT_PROMPT),
    ...(state.messages || []),
    new HumanMessage({
      content: [
        {
          type: "text",
          text: state.browserInstruction || state.userInput || "",
        },
        {
          type: "image_url",
          image_url: {
            url: `data:image/png;base64,${currentScreenshot.toString("base64")}`,
          },
        },
      ],
    }),
  ];

  return {
    messages: await modelWithTools.invoke(messages),
  };
}
