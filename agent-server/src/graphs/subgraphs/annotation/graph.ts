import { StateGraph, START, END } from "@langchain/langgraph";

import { syncPageNode, labelElementsNode, screenshotNode } from "./nodes";
import { MainGraphState } from "../../base/state";

export const annotationGraph = new StateGraph(MainGraphState)
  .addNode("sync_page", syncPageNode)
  .addNode("label_elements", labelElementsNode)
  .addNode("screenshot", screenshotNode)
  .addEdge(START, "sync_page")
  .addEdge("sync_page", "label_elements")
  .addEdge("label_elements", "screenshot")
  .addEdge("screenshot", END)
  .compile();

annotationGraph.name = "Annotation";
