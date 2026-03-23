import { interrupt } from "@langchain/langgraph";
import type { InputHandlerStateType } from "../state";
import { Logger } from "../../../../libs/utils";

export function handleInputInterruptNode(
  state: InputHandlerStateType,
): Partial<InputHandlerStateType> {
  const request = state.inputRequest;

  if (!request?.fields?.length) {
    Logger.info(
      "input-handler",
      "No input request or fields, returning empty values",
    );
    return { inputValues: {} };
  }

  Logger.info(
    "input-handler",
    `Requesting input for ${request.fields.length} fields`,
  );
  Logger.info("input-handler", `Prompt: ${request.prompt}`);

  const properties: Record<
    string,
    { type: string; title: string; description?: string }
  > = {};
  const required: string[] = [];

  for (const field of request.fields) {
    const fieldKey = field.id.toString();
    properties[fieldKey] = {
      type: "string",
      title: field.label,
      description: field.placeholder,
    };
    if (field.required) {
      required.push(fieldKey);
    }
  }

  const userResponse: unknown = interrupt({
    action_requests: [
      {
        name: "provide_input",
        args: Object.fromEntries(
          request.fields.map((f) => [f.id.toString(), ""]),
        ),
        description: request.prompt,
      },
    ],
    review_configs: [
      {
        action_name: "provide_input",
        allowed_decisions: ["edit", "approve"],
        args_schema: {
          type: "object",
          properties,
          required: required.length > 0 ? required : undefined,
        },
      },
    ],
  });

  Logger.info("input-handler", "Received user response", userResponse);

  let inputValues: Record<string, string> = {};

  if (userResponse && typeof userResponse === "object") {
    const response = userResponse as Record<string, unknown>;
    if (response.decisions && Array.isArray(response.decisions)) {
      const decision = response.decisions[0] as {
        type?: string;
        edited_action?: { args?: Record<string, string> };
      };
      if (
        (decision?.type === "approve" || decision?.type === "edit") &&
        decision.edited_action?.args
      ) {
        inputValues = decision.edited_action.args;
      }
    }
  }

  Logger.info(
    "input-handler",
    `Parsed ${Object.keys(inputValues).length} input values`,
  );

  return { inputValues };
}
