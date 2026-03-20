import { StateGraph } from "@langchain/langgraph";

import { CaptchaState } from "./state";
import {
  detectCaptchaNode,
  handleInterruptNode,
  verifySolvedNode,
  shouldInterrupt,
  shouldVerify,
} from "./nodes";

export const captchaHandlerGraph = new StateGraph(CaptchaState)
  .addNode("detect", detectCaptchaNode)
  .addNode("interrupt", handleInterruptNode)
  .addNode("verify", verifySolvedNode)
  .addEdge("__start__", "detect")
  .addConditionalEdges("detect", shouldInterrupt, {
    interrupt: "interrupt",
    end: "__end__",
  })
  .addConditionalEdges("interrupt", shouldVerify, {
    verify: "verify",
    interrupt: "interrupt",
  })
  .addConditionalEdges("verify", shouldInterrupt, {
    interrupt: "interrupt",
    end: "__end__",
  })
  .compile();
