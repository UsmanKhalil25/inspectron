import { StateGraph, START, END } from "@langchain/langgraph";

import { MainGraphState } from "../../base/state";
import {
  detectCaptchaNode,
  handleInterruptNode,
  verifySolvedNode,
  shouldInterrupt,
  shouldVerify,
} from "./nodes";

export const captchaGraph = new StateGraph(MainGraphState)
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
