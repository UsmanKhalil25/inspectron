import { StateGraph, START, END } from "@langchain/langgraph";

import {
  initialLLMCallNode,
  llmCallNode,
  captureScreenshotNode,
  initializationNode,
  labelElementsNode,
  cleanupNode,
  toolNode,
  shouldContinue,
  shouldInitializeBrowser,
} from "./nodes.js";
import { AgentState } from "./state.js";

const graph = new StateGraph(AgentState)
  .addNode("decide_browser_needed", initialLLMCallNode)
  .addNode("initialize_browser", initializationNode)
  .addNode("cleanup_browser", cleanupNode)
  .addNode("label_page_elements", labelElementsNode)
  .addNode("capture_page_screenshot", captureScreenshotNode)
  .addNode("agent_decision", llmCallNode)
  .addNode("execute_tools", toolNode)
  .addEdge(START, "decide_browser_needed")
  .addConditionalEdges("decide_browser_needed", shouldInitializeBrowser, {
    initialization: "initialize_browser",
    [END]: END,
  })
  .addEdge("initialize_browser", "execute_tools")
  .addEdge("execute_tools", "label_page_elements")
  .addEdge("label_page_elements", "capture_page_screenshot")
  .addEdge("capture_page_screenshot", "agent_decision")
  .addConditionalEdges("agent_decision", shouldContinue, {
    toolNode: "execute_tools",
    [END]: "cleanup_browser",
  })
  .addEdge("cleanup_browser", END)
  .compile();

graph.name = "Agent";

export default graph;
