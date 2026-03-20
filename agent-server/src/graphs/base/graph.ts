import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";

import {
  initialPlanNode,
  reasonNode,
  screenshotNode,
  openBrowserNode,
  labelElementsNode,
  syncPageNode,
  closeBrowserNode,
  runToolsNode,
  shouldContinue,
  shouldInitializeBrowser,
  shouldRunLoginHandler,
  detectLoginNode,
} from "./nodes";
import { AgentState } from "./state";
import { captchaHandlerGraph } from "../subgraphs/captcha-handler";
import { loginHandlerGraph } from "../subgraphs/login-handler";

const checkpointer = new MemorySaver();

export const graph = new StateGraph(AgentState)
  .addNode("initialPlan", initialPlanNode)
  .addNode("openBrowser", openBrowserNode)
  .addNode("closeBrowser", closeBrowserNode)
  .addNode("syncPage", syncPageNode)
  .addNode("labelElements", labelElementsNode)
  .addNode("screenshot", screenshotNode)
  .addNode("loginHandler", loginHandlerGraph)
  .addNode("captchaHandler", captchaHandlerGraph)
  .addNode("detectLogin", detectLoginNode)
  .addNode("reason", reasonNode)
  .addNode("runTools", runToolsNode)
  .addEdge(START, "initialPlan")
  .addConditionalEdges("initialPlan", shouldInitializeBrowser, {
    initialization: "openBrowser",
    [END]: END,
  })
  .addEdge("openBrowser", "runTools")
  .addEdge("runTools", "syncPage")
  .addEdge("syncPage", "detectLogin")
  .addConditionalEdges("detectLogin", shouldRunLoginHandler, {
    check_login: "loginHandler",
    skip_login: "labelElements",
  })
  .addEdge("loginHandler", "labelElements")
  .addEdge("labelElements", "screenshot")
  .addEdge("screenshot", "captchaHandler")
  .addEdge("captchaHandler", "reason")
  .addConditionalEdges("reason", shouldContinue, {
    toolNode: "runTools",
    [END]: "closeBrowser",
  })
  .addEdge("closeBrowser", END)
  .compile({
    checkpointer,
  });

graph.name = "WorkflowGraph";
