import { StateGraph, START, END } from "@langchain/langgraph";

import { AnnotationGraphState } from "./state";
import { syncPageNode, labelElementsNode, screenshotNode } from "./nodes";

export const annotationGraph = new StateGraph(AnnotationGraphState)
  .addNode("sync_page", syncPageNode)
  .addNode("label_elements", labelElementsNode)
  .addNode("screenshot", screenshotNode)
  .addEdge(START, "sync_page")
  .addEdge("sync_page", "label_elements")
  .addEdge("label_elements", "screenshot")
  .addEdge("screenshot", END)
  .compile();

annotationGraph.name = "Annotation";
