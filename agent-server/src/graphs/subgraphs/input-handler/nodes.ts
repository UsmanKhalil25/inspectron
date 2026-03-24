import { interrupt } from "@langchain/langgraph";
import { AIMessage } from "@langchain/core/messages";
import type { MainGraphStateType } from "../../base/state";
import { BrowserManager } from "../../../libs";
import { Logger } from "../../../libs/utils";

const DEFAULT_WAIT_MS = 500;

export function interruptForInputNode(state: MainGraphStateType) {
  const instruction = state.inputHandlerInstruction || "Input required";
  const fieldType = state.inputHandlerFieldType || "text";

  const userResponse: unknown = interrupt({
    action_requests: [
      {
        name: "provide_input",
        args: { value: "" },
        description: `Input required: ${instruction}`,
      },
    ],
    review_configs: [
      {
        action_name: "provide_input",
        allowed_decisions: ["edit", "approve"],
        args_schema: {
          type: "object",
          properties: {
            value: {
              type: "string",
              title: instruction,
              description: "Enter the value for this field",
              ...(fieldType === "password" ? { format: "password" } : {}),
            },
          },
          required: ["value"],
        },
      },
    ],
  });

  Logger.info("input-handler", "Received user response", userResponse);

  let value: string | undefined;

  if (userResponse && typeof userResponse === "object") {
    const response = userResponse as Record<string, unknown>;

    if (response.decisions && Array.isArray(response.decisions)) {
      const decision = response.decisions[0] as {
        type?: string;
        edited_action?: { args?: { value?: string } };
      };
      if (
        (decision?.type === "approve" || decision?.type === "edit") &&
        decision.edited_action?.args
      ) {
        value = decision.edited_action.args.value ?? "";
      }
    }
  }

  Logger.info("input-handler", "Parsed value", {
    received: value !== undefined ? "yes" : "no",
  });

  return { inputHandlerValue: value };
}

export async function writeInputNode(state: MainGraphStateType) {
  const page = await BrowserManager.getPage();
  if (!page) {
    Logger.warn("input-handler", "No page available");
    return {
      inputHandlerValue: undefined,
      inputHandlerElementId: undefined,
      inputHandlerFieldType: undefined,
      inputHandlerInstruction: undefined,
    };
  }

  const elementId = state.inputHandlerElementId;
  const value = state.inputHandlerValue ?? "";

  if (elementId === undefined) {
    Logger.warn("input-handler", "No elementId in state");
    return {
      inputHandlerValue: undefined,
      inputHandlerElementId: undefined,
      inputHandlerFieldType: undefined,
      inputHandlerInstruction: undefined,
    };
  }

  const element = state.interactiveElements?.find((el) => el.id === elementId);
  if (!element) {
    Logger.warn("input-handler", `No element found with id ${elementId}`);
    return {
      inputHandlerValue: undefined,
      inputHandlerElementId: undefined,
      inputHandlerFieldType: undefined,
      inputHandlerInstruction: undefined,
    };
  }

  const { x, y, width, height } = element.boundingBox;

  // Click to focus the field
  await page.mouse.click(x + width / 2, y + height / 2);
  await page.waitForTimeout(100);

  // Select all and clear existing text
  const selectAll = process.platform === "darwin" ? "Meta+A" : "Control+A";
  await page.keyboard.press(selectAll);
  await page.waitForTimeout(50);
  await page.keyboard.press("Backspace");
  await page.waitForTimeout(50);

  // Type the value
  await page.keyboard.type(value, { delay: 10 });
  await page.waitForTimeout(DEFAULT_WAIT_MS);

  Logger.info("input-handler", `Typed value into element ${elementId}`);

  const fieldLabel = state.inputHandlerInstruction || "input field";
  const message = new AIMessage({
    content: `Input provided for ${fieldLabel} (element ${elementId}). The value has been entered into the field. Proceed with the next step.`,
  });

  return {
    inputHandlerValue: undefined,
    inputHandlerElementId: undefined,
    inputHandlerFieldType: undefined,
    inputHandlerInstruction: undefined,
    messages: [message],
  };
}
