import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";

import {
  initialPlanNode,
  openBrowserNode,
  closeBrowserNode,
  routeAfterInitialPlan,
  mainAgentNode,
  routeAfterMainAgent,
} from "./nodes";
import { MainGraphState } from "./state";
import { annotationGraph } from "../subgraphs/annotation";
import { browserAgentGraph } from "../subgraphs/browser-agent";
import { captchaGraph } from "../subgraphs/captcha";
import { inputHandlerGraph } from "../subgraphs/input-handler";

const checkpointer = new MemorySaver();

export const graph = new StateGraph(MainGraphState)
  .addNode("initial_plan", initialPlanNode)
  .addNode("open_browser", openBrowserNode)
  .addNode("annotation", annotationGraph)
  .addNode("main_agent", mainAgentNode)
  .addNode("browser_agent", browserAgentGraph)
  .addNode("captcha_handler", captchaGraph)
  .addNode("input_handler", inputHandlerGraph)
  .addNode("close_browser", closeBrowserNode)
  .addEdge(START, "initial_plan")
  .addConditionalEdges("initial_plan", routeAfterInitialPlan, {
    open_browser: "open_browser",
    [END]: END,
  })
  .addEdge("open_browser", "annotation")
  .addEdge("annotation", "main_agent")
  .addConditionalEdges("main_agent", routeAfterMainAgent, {
    browser_agent: "browser_agent",
    captcha_handler: "captcha_handler",
    input_handler: "input_handler",
    close_browser: "close_browser",
  })
  .addEdge("browser_agent", "annotation")
  .addEdge("captcha_handler", "annotation")
  .addEdge("input_handler", "annotation")
  .addEdge("close_browser", END)
  .compile({ checkpointer });

graph.name = "MainGraph";
