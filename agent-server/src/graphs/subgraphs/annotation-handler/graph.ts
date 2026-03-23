import { StateGraph, START, END } from "@langchain/langgraph";

import { AnnotationHandlerState } from "./state";
import { syncPageNode, labelElementsNode, screenshotNode } from "./nodes";

export const annotationHandler = new StateGraph(AnnotationHandlerState)
  .addNode("syncPage", syncPageNode)
  .addNode("labelElements", labelElementsNode)
  .addNode("screenshot", screenshotNode)
  .addEdge(START, "syncPage")
  .addEdge("syncPage", "labelElements")
  .addEdge("labelElements", "screenshot")
  .addEdge("screenshot", END)
  .compile();

annotationHandler.name = "AnnotationHandler";
