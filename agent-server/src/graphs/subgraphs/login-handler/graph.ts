import { StateGraph } from "@langchain/langgraph";

import { LoginState } from "./state.ts";
import {
  detectLoginNode,
  handleLoginInterruptNode,
  performLoginNode,
  shouldRequestCredentials,
} from "./nodes.ts";

export const loginHandlerGraph = new StateGraph(LoginState)
  .addNode("detect", detectLoginNode)
  .addNode("interrupt", handleLoginInterruptNode)
  .addNode("login", performLoginNode)
  .addEdge("__start__", "detect")
  .addConditionalEdges("detect", shouldRequestCredentials, {
    interrupt: "interrupt",
    login: "login",
    end: "__end__",
  })
  .addEdge("interrupt", "login")
  .addEdge("login", "__end__")
  .compile();
