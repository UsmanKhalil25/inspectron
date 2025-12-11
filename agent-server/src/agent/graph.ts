import { StateGraph, START, END } from "@langchain/langgraph";

import {
  llmCallNode,
  captureScreenshotNode,
  initializationNode,
  labelElementsNode,
  cleanupNode,
  toolNode,
  shouldContinue,
} from "./nodes.js";
import { AgentState } from "./state.js";

const graph = new StateGraph(AgentState)
  .addNode("initialization", initializationNode)
  .addNode("cleanup", cleanupNode)
  .addNode("labelElements", labelElementsNode)
  .addNode("captureScreenshot", captureScreenshotNode)
  .addNode("llmCall", llmCallNode)
  .addNode("toolNode", toolNode)
  .addEdge(START, "initialization")
  .addEdge("initialization", "labelElements")
  .addEdge("labelElements", "captureScreenshot")
  .addEdge("captureScreenshot", "llmCall")
  .addConditionalEdges("llmCall", shouldContinue, {
    toolNode: "toolNode",
    [END]: "cleanup",
  })
  .addEdge("toolNode", "labelElements")
  .addEdge("cleanup", END)
  .compile();

graph.name = "Agent";

export default graph;
