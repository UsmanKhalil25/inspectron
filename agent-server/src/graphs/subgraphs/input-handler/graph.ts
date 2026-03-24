import { StateGraph, START, END } from "@langchain/langgraph";

import { MainGraphState } from "../../base/state";
import { interruptForInputNode, writeInputNode } from "./nodes";

export const inputHandlerGraph = new StateGraph(MainGraphState)
  .addNode("interrupt_for_input", interruptForInputNode)
  .addNode("write_input", writeInputNode)
  .addEdge(START, "interrupt_for_input")
  .addEdge("interrupt_for_input", "write_input")
  .addEdge("write_input", END)
  .compile();

inputHandlerGraph.name = "InputHandler";
