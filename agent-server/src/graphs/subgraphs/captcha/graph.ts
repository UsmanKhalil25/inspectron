import { StateGraph, START, END } from "@langchain/langgraph";

import { CaptchaGraphState } from "./state";
import {
  detectCaptchaNode,
  handleInterruptNode,
  verifySolvedNode,
  shouldInterrupt,
  shouldVerify,
} from "./nodes";

export const captchaGraph = new StateGraph(CaptchaGraphState)
  .addNode("detect", detectCaptchaNode)
  .addNode("interrupt", handleInterruptNode)
  .addNode("verify", verifySolvedNode)
  .addEdge(START, "detect")
  .addConditionalEdges("detect", shouldInterrupt, {
    interrupt: "interrupt",
    end: END,
  })
  .addConditionalEdges("interrupt", shouldVerify, {
    verify: "verify",
    interrupt: "interrupt",
  })
  .addConditionalEdges("verify", shouldInterrupt, {
    interrupt: "interrupt",
    end: END,
  })
  .compile();

captchaGraph.name = "Captcha";
