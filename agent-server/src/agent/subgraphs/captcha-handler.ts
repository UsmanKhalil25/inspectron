import { StateGraph, interrupt } from "@langchain/langgraph";
import * as z from "zod";
import { Page } from "playwright";
import { detectCaptcha } from "../../utils/captcha-detector.js";
import { BrowserFactory } from "../factory";

const CaptchaState = z.object({
  img: z.string().optional(),
  captchaType: z.string().optional(),
  solved: z.boolean().optional(),
  url: z.string().optional(),
});

type CaptchaStateType = z.infer<typeof CaptchaState>;

async function detectCaptchaNode(state: CaptchaStateType) {
  const page = await BrowserFactory.getPage();

  const result = await detectCaptcha(page);

  if (!result.detected) {
    return {
      captchaType: "none",
      solved: true,
    };
  }

  const url = page.url();

  return {
    captchaType: result.type,
    solved: false,
    url,
  };
}

async function handleInterruptNode(state: CaptchaStateType) {
  const captchaType = state.captchaType || "Unknown";
  const url = state.url || "unknown";

  const userConfirmation = interrupt({
    action_requests: [
      {
        name: "solve_captcha",
        args: {
          captchaType,
          url,
          message: `A ${captchaType} has been detected. Please solve it manually in the browser and then click Continue.`,
        },
        description: `Solve ${captchaType} captcha`,
      },
    ],
    review_configs: [
      {
        action_name: "solve_captcha",
        allowed_decisions: ["approve"],
      },
    ],
  });

  console.log(
    "Received user confirmation:",
    JSON.stringify(userConfirmation, null, 2),
  );

  let solved = false;

  if (userConfirmation && typeof userConfirmation === "object") {
    const confirmation = userConfirmation as any;

    if (confirmation.decisions && Array.isArray(confirmation.decisions)) {
      const decision = confirmation.decisions[0];
      solved = decision?.type === "approve";
    } else if (Array.isArray(userConfirmation)) {
      const decision = userConfirmation[0];
      solved = decision?.type === "approve";
    } else if (confirmation.type) {
      solved = confirmation.type === "approve";
    }
  }

  console.log("Captcha solved status:", solved);

  return { solved };
}

async function verifySolvedNode(state: CaptchaStateType) {
  console.log("Verifying captcha solved, current state:", {
    captchaType: state.captchaType,
    solved: state.solved,
  });

  const page = await BrowserFactory.getPage();

  const result = await detectCaptcha(page);

  if (result.detected) {
    console.log("Captcha still detected:", result.type);
    return {
      captchaType: result.type,
      solved: false,
    };
  }

  console.log("Captcha verification passed, no captcha detected");
  return {
    captchaType: "none",
    solved: true,
  };
}

function shouldInterrupt(state: CaptchaStateType) {
  const shouldEnd = state.captchaType === "none" || state.solved;
  console.log("shouldInterrupt check:", {
    captchaType: state.captchaType,
    solved: state.solved,
    decision: shouldEnd ? "end" : "interrupt",
  });
  if (shouldEnd) {
    return "end";
  }
  return "interrupt";
}

function shouldVerify(state: CaptchaStateType) {
  const decision = state.solved ? "verify" : "interrupt";
  console.log("shouldVerify check:", { solved: state.solved, decision });
  return decision;
}

const workflow = new StateGraph(CaptchaState)
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
  });

export const captchaHandlerGraph = workflow
  .compile({ checkpointer: true })
  .withConfig({
    recursionLimit: 1000,
  });
