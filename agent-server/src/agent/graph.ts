import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";

import {
  initialLLMCallNode,
  llmCallNode,
  captureScreenshotNode,
  initializationNode,
  labelElementsNode,
  ensurePageNode,
  cleanupNode,
  toolNode,
  shouldContinue,
  shouldInitializeBrowser,
} from "./nodes.js";
import { AgentState } from "./state.js";
import { captchaHandlerGraph } from "./subgraphs/captcha-handler.js";
import { loginHandlerGraph } from "./subgraphs/login-handler.js";

const checkpointer = new MemorySaver();

const graph = new StateGraph(AgentState)
  .addNode("decide_browser_needed", initialLLMCallNode)
  .addNode("initialize_browser", initializationNode)
  .addNode("cleanup_browser", cleanupNode)
  .addNode("ensure_page", ensurePageNode)
  .addNode("label_page_elements", labelElementsNode)
  .addNode("capture_page_screenshot", captureScreenshotNode)
  .addNode("login_handler", loginHandlerGraph)
  .addNode("captcha_handler", captchaHandlerGraph)
  .addNode("agent_decision", llmCallNode)
  .addNode("execute_tools", toolNode)
  .addEdge(START, "decide_browser_needed")
  .addConditionalEdges("decide_browser_needed", shouldInitializeBrowser, {
    initialization: "initialize_browser",
    [END]: END,
  })
  .addEdge("initialize_browser", "execute_tools")
  .addEdge("execute_tools", "ensure_page")
  .addEdge("ensure_page", "label_page_elements")
  .addEdge("label_page_elements", "capture_page_screenshot")
  .addEdge("capture_page_screenshot", "login_handler")
  .addEdge("login_handler", "captcha_handler")
  .addEdge("captcha_handler", "agent_decision")
  .addConditionalEdges("agent_decision", shouldContinue, {
    toolNode: "execute_tools",
    [END]: "cleanup_browser",
  })
  .addEdge("cleanup_browser", END)
  .compile({
    checkpointer,
  });

graph.name = "WorkflowGraph";

export default graph;
