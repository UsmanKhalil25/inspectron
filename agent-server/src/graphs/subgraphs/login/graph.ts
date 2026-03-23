import { StateGraph, START, END } from "@langchain/langgraph";

import { LoginGraphState } from "./state";
import {
  detectLoginNode,
  handleLoginInterruptNode,
  performLoginNode,
  shouldRequestCredentials,
} from "./nodes";

export const loginGraph = new StateGraph(LoginGraphState)
  .addNode("detect", detectLoginNode)
  .addNode("interrupt", handleLoginInterruptNode)
  .addNode("login", performLoginNode)
  .addEdge(START, "detect")
  .addConditionalEdges("detect", shouldRequestCredentials, {
    interrupt: "interrupt",
    login: "login",
    end: END,
  })
  .addEdge("interrupt", "login")
  .addEdge("login", END)
  .compile();

loginGraph.name = "Login";
