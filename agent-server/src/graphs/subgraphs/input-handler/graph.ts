import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import type { Page } from "playwright";
import { PageElement } from "../../../libs/schemas/page-elements";
import type { InputRequest } from "./state";
import { handleInputInterruptNode } from "./nodes";

export const InputHandlerState = Annotation.Root({
  page: Annotation<Page | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  interactiveElements: Annotation<PageElement[]>({
    reducer: (x, y) => (y.length ? y : x),
    default: () => [],
  }),
  img: Annotation<string | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  inputRequest: Annotation<InputRequest | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
  inputValues: Annotation<Record<string, string> | undefined>({
    value: (_, y) => y,
    default: () => undefined,
  }),
});

export const inputHandler = new StateGraph(InputHandlerState)
  .addNode("interrupt", handleInputInterruptNode)
  .addEdge(START, "interrupt")
  .addEdge("interrupt", END)
  .compile();

inputHandler.name = "InputHandler";
