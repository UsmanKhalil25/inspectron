import { StateGraph, START, END } from "@langchain/langgraph";

import { MainGraphState } from "../../base/state";
import {
  modelInvocation,
  executeAgentTools,
  routeAfterModelInvocation,
} from "./nodes";

export const browserAgentGraph = new StateGraph(MainGraphState)
  .addNode("model_invocation", modelInvocation)
  .addNode("execute_tools", executeAgentTools)
  .addEdge(START, "model_invocation")
  .addConditionalEdges("model_invocation", routeAfterModelInvocation, {
    execute_tools: "execute_tools",
    [END]: END,
  })
  .addEdge("execute_tools", END)
  .compile();

browserAgentGraph.name = "BrowserAgentGraph";
