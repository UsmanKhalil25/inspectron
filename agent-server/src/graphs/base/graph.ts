import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";

import {
  initialPlanNode,
  openBrowserNode,
  closeBrowserNode,
  routeAfterInitialPlan,
  agentNode,
} from "./nodes";
import { MainState } from "./state";

import { annotationHandler } from "../subgraphs/annotation-handler";

const checkpointer = new MemorySaver();

export const graph = new StateGraph(MainState)
  .addNode("initialPlan", initialPlanNode)
  .addNode("openBrowser", openBrowserNode)
  .addNode("annotationHandler", annotationHandler)
  .addNode("agentNode", agentNode)
  .addNode("closeBrowser", closeBrowserNode)
  .addEdge(START, "initialPlan")
  .addConditionalEdges("initialPlan", routeAfterInitialPlan, {
    openBrowser: "openBrowser",
    [END]: END,
  })
  .addEdge("openBrowser", "annotationHandler")
  .addEdge("annotationHandler", "agentNode")
  .addEdge("agentNode", "closeBrowser")
  .addEdge("closeBrowser", END)
  .compile({ checkpointer });

graph.name = "MainGraph";
