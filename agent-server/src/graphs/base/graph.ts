import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";

import {
  initialPlanNode,
  openBrowserNode,
  closeBrowserNode,
  routeAfterInitialPlan,
  agentNode,
  routeAfterAgent,
} from "./nodes";
import { MainState } from "./state";

import { annotationHandler } from "../subgraphs/annotation-handler";
import { inputHandler } from "../subgraphs/input-handler";

const checkpointer = new MemorySaver();

export const graph = new StateGraph(MainState)
  .addNode("initialPlan", initialPlanNode)
  .addNode("openBrowser", openBrowserNode)
  .addNode("annotationHandler", annotationHandler)
  .addNode("agentNode", agentNode)
  .addNode("inputHandler", inputHandler)
  .addNode("closeBrowser", closeBrowserNode)
  .addEdge(START, "initialPlan")
  .addConditionalEdges("initialPlan", routeAfterInitialPlan, {
    openBrowser: "openBrowser",
    [END]: END,
  })
  .addEdge("openBrowser", "annotationHandler")
  .addEdge("annotationHandler", "agentNode")
  .addConditionalEdges("agentNode", routeAfterAgent, {
    close: "closeBrowser",
    annotationHandler: "annotationHandler",
    inputHandler: "inputHandler",
  })
  .addEdge("inputHandler", "agentNode")
  .addEdge("closeBrowser", END)
  .compile({ checkpointer });

graph.name = "MainGraph";
