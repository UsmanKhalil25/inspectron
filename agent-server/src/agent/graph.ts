import { StateGraph, START, END } from "@langchain/langgraph";

import { MessagesState } from "./state.js";
import { llmCall, toolNode, shouldContinue } from "./nodes.js";

const graph = new StateGraph(MessagesState)
  .addNode("llmCall", llmCall)
  .addNode("toolNode", toolNode)
  .addEdge(START, "llmCall")
  .addConditionalEdges("llmCall", shouldContinue, ["toolNode", END])
  .addEdge("toolNode", "llmCall")
  .compile();

graph.name = "New Agent";

export default graph;
