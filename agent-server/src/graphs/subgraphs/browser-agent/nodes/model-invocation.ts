import {
  SystemMessage,
  HumanMessage,
  type BaseMessage,
} from "@langchain/core/messages";

import { LlmFactory } from "../../../../clients/llm";
import { WEB_BROWSING_AGENT_PROMPT } from "../../../base/prompts";
import { loadImage } from "../../../../libs/utils";
import {
  click,
  typeText,
  scroll,
  navigate,
  wait,
  goBack,
  getText,
} from "../../../base/tools";
import type { MainGraphStateType } from "../../../base/state";
import { StructuredTool } from "langchain";

export async function modelInvocation(
  state: MainGraphStateType,
): Promise<{ messages: BaseMessage[] }> {
  if (!state.currentScreenshotPath) {
    throw new Error("Screenshot path not found in state");
  }

  const currentScreenshot = await loadImage(state.currentScreenshotPath);

  const model = LlmFactory.getLLM();
  const tools: StructuredTool[] = [
    click(state),
    typeText(state),
    scroll(state),
    navigate(state),
    wait(state),
    goBack(state),
    getText(state),
  ];
  const modelWithTools = model.bindTools(tools);

  const existingMessages: BaseMessage[] = state.messages ?? [];
  const newHumanMessage = new HumanMessage({
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
  });

  const messages = [
    new SystemMessage(WEB_BROWSING_AGENT_PROMPT),
    ...existingMessages,
    newHumanMessage,
  ];

  const result = await modelWithTools.invoke(messages);

  return {
    messages: Array.isArray(result) ? result : [result],
  };
}
