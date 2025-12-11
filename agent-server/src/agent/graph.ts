import { StateGraph, START, END } from "@langchain/langgraph";

import { captureScreenshotNode, labelElementsNode } from "./nodes.js";
import { AgentState} from "./state.js";


const graph = new StateGraph(AgentState)
  .addNode("labelElements", labelElementsNode)
  .addNode("captureScreenshot", captureScreenshotNode)

graph.name = "New Agent";

export default graph;
