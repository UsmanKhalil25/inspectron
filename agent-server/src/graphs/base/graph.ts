import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";

import {
  initialPlanNode,
  openBrowserNode,
  closeBrowserNode,
  routeAfterInitialPlan,
  modelInvocation,
  executeAgentTools,
  routeAfterModelInvocation,
  routeAfterTools,
} from "./nodes";
import { MainGraphState } from "./state";
import { annotationGraph } from "../subgraphs/annotation";

const checkpointer = new MemorySaver();

export const graph = new StateGraph(MainGraphState)
  .addNode("initial_plan", initialPlanNode)
  .addNode("open_browser", openBrowserNode)
  .addNode("annotation", annotationGraph)
  .addNode("model_invocation", modelInvocation)
  .addNode("execute_tools", executeAgentTools)
  .addNode("close_browser", closeBrowserNode)
  .addEdge(START, "initial_plan")
  .addConditionalEdges("initial_plan", routeAfterInitialPlan, {
    open_browser: "open_browser",
    [END]: END,
  })
  .addEdge("open_browser", "annotation")
  .addEdge("annotation", "model_invocation")
  .addConditionalEdges("model_invocation", routeAfterModelInvocation, {
    execute_tools: "execute_tools",
    close_browser: "close_browser",
  })
  .addConditionalEdges("execute_tools", routeAfterTools, {
    annotation: "annotation",
    close_browser: "close_browser",
  })
  .addEdge("close_browser", END)
  .compile({ checkpointer });

graph.name = "MainGraph";
