import {
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";
import { z } from "zod";
import { MainStateType, NextStep, InputField } from "../state";
import { AGENT_NODE_PROMPT } from "../prompts";
import { LlmFactory } from "../../../clients/llm";
import { click, typeText, scroll, navigate, wait, goBack } from "../tools";

const RouteSchema = z.object({
  reasoning: z.string().describe("Brief explanation of your decision"),
  action: z
    .enum(["continue", "complete", "need_input"])
    .describe(
      "continue: taking an action, complete: task done, need_input: blocked on unknown values",
    ),
  message: z
    .string()
    .optional()
    .describe(
      "If need_input, describe what values are needed (e.g., 'Login credentials required')",
    ),
  inputFields: z
    .array(
      z.object({
        id: z.number().describe("Element ID from interactive elements"),
        label: z.string().describe("Human-readable label for the field"),
        type: z
          .enum([
            "text",
            "email",
            "password",
            "tel",
            "number",
            "url",
            "search",
            "textarea",
          ])
          .optional(),
        placeholder: z.string().optional(),
        required: z.boolean().optional(),
      }),
    )
    .optional()
    .describe("If need_input, list the fields that need user values"),
});

function formatElements(
  elements: MainStateType["interactiveElements"],
): string {
  if (!elements || elements.length === 0) {
    return "No interactive elements found.";
  }
  return elements
    .map((el) => `[${el.id}] <${el.tag}>: ${el.text || "(no text)"}`)
    .join("\n");
}

function formatVisitedUrls(urls: string[]): string {
  if (urls.length === 0) {
    return "No URLs visited yet.";
  }
  return urls.map((url) => `- ${url}`).join("\n");
}

function formatInputValues(
  inputValues: Record<string, string> | undefined,
): string {
  if (!inputValues || Object.keys(inputValues).length === 0) {
    return "";
  }
  return Object.entries(inputValues)
    .map(([id, value]) => `- Field ${id}: "${value}"`)
    .join("\n");
}

export async function agentNode(
  state: MainStateType,
): Promise<Partial<MainStateType>> {
  const model = LlmFactory.getLLM();

  // If we have inputValues from inputHandler, provide them to the agent
  const hasInputValues =
    state.inputValues && Object.keys(state.inputValues).length > 0;
  if (hasInputValues) {
    console.log("[Agent Node] Input values received:", state.inputValues);
  }

  // Bind only action tools (not route tool)
  const actionTools = [
    click(state),
    typeText(state),
    scroll(state),
    navigate(state),
    wait(state),
    goBack(state),
  ];

  const modelWithTools = model.bindTools(actionTools);

  const goal = state.goal || state.input || "No goal specified";
  let promptWithGoal = AGENT_NODE_PROMPT.replace("{goal}", goal);

  // Add input values context if available
  if (hasInputValues) {
    promptWithGoal += `\n\nUSER INPUT AVAILABLE:\nThe user has provided values for the following fields:\n${formatInputValues(state.inputValues)}\n\nUse the typeText tool to fill these values into the corresponding form fields. After filling all fields, click the submit button if applicable.`;
  }

  const systemMessage = new SystemMessage(promptWithGoal);

  let elementsContext = `INTERACTIVE ELEMENTS:\n${formatElements(state.interactiveElements)}\n\nVISITED URLs (DO NOT NAVIGATE TO THESE):\n${formatVisitedUrls(state.visitedUrls || [])}`;

  if (hasInputValues) {
    elementsContext += `\n\nINPUT VALUES TO USE:\n${formatInputValues(state.inputValues)}`;
  }

  const elementsMessage = new HumanMessage(elementsContext);

  const recentMessages = (state.messages || [])
    .filter((m) => m instanceof AIMessage || m instanceof HumanMessage)
    .slice(-6);

  const messages = [systemMessage, elementsMessage, ...recentMessages];

  // First, let the model take action with tools
  const response = await modelWithTools.invoke(messages);

  const toolCalls = response.tool_calls || [];
  const hasActionCalls = toolCalls.length > 0;

  const newMessages: (AIMessage | HumanMessage)[] = [response];

  // If the model took an action, route to annotationHandler for fresh screenshot
  if (hasActionCalls) {
    console.log(
      `[Agent Node] Model took ${toolCalls.length} action(s):`,
      toolCalls.map((tc) => tc.name),
    );
    return {
      messages: newMessages,
      nextStep: "annotationHandler" as NextStep,
      llmCalls: (state.llmCalls ?? 0) + 1,
    };
  }

  // No action taken - determine why using structured output
  const routeModel = model.withStructuredOutput(RouteSchema);
  const routeDecision = await routeModel.invoke([
    ...messages,
    new HumanMessage(
      "You didn't take any action. Analyze the situation and respond with your routing decision.",
    ),
  ]);

  console.log("[Agent Node] Route decision:", routeDecision);

  let nextStep: NextStep;
  let inputRequest: { fields: InputField[]; prompt: string } | undefined;

  if (routeDecision.action === "complete") {
    nextStep = "close";
    newMessages.push(
      new HumanMessage(`[Task complete: ${routeDecision.reasoning}]`),
    );
  } else if (routeDecision.action === "need_input") {
    nextStep = "inputHandler";
    const fields: InputField[] = (routeDecision.inputFields || []).map((f) => ({
      id: f.id,
      label: f.label,
      type: f.type,
      placeholder: f.placeholder,
      required: f.required,
    }));
    inputRequest = {
      fields,
      prompt:
        routeDecision.message ||
        "Please provide input for the required fields.",
    };
    newMessages.push(
      new HumanMessage(`[Need input: ${routeDecision.message}]`),
    );
    console.log(
      `[Agent Node] Routing to inputHandler with ${fields.length} fields`,
    );
  } else {
    // action === "continue" - should have taken an action, but didn't
    // Default to annotationHandler to get fresh state
    nextStep = "annotationHandler";
  }

  // Clear inputValues after using them
  const clearInputValues = state.inputValues ? { inputValues: undefined } : {};

  return {
    messages: newMessages,
    nextStep,
    llmCalls: (state.llmCalls ?? 0) + 2, // +2 for action attempt + route decision
    inputRequest,
    ...clearInputValues,
  };
}
