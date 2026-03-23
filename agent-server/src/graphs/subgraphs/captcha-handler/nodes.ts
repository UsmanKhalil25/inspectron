import { interrupt } from "@langchain/langgraph";
import type { CaptchaStateType } from "./state";
import { detectCaptcha } from "../../../libs/utils/captcha-detector";
import { Logger } from "../../../libs/utils";

export async function detectCaptchaNode(state: CaptchaStateType) {
  const page = state.page;
  if (!page) {
    Logger.warn("captcha-handler", "No page available in state");
    return {
      captchaType: "none",
      solved: true,
    };
  }

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

export function handleInterruptNode(state: CaptchaStateType) {
  const captchaType = state.captchaType || "Unknown";
  const url = state.url || "unknown";

  const userConfirmation: unknown = interrupt({
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

  Logger.info("captcha-handler", "Received user confirmation", userConfirmation);

  let solved = false;

  if (userConfirmation && typeof userConfirmation === "object") {
    const confirmation = userConfirmation as Record<string, unknown>;

    if (confirmation.decisions && Array.isArray(confirmation.decisions)) {
      const decision = confirmation.decisions[0] as { type?: string };
      solved = decision?.type === "approve";
    } else if (Array.isArray(userConfirmation)) {
      const decision = userConfirmation[0] as { type?: string };
      solved = decision?.type === "approve";
    } else if (confirmation.type) {
      solved = confirmation.type === "approve";
    }
  }

  Logger.info("captcha-handler", "Captcha solved status", { solved });

  return { solved };
}

export async function verifySolvedNode(state: CaptchaStateType) {
  Logger.info("captcha-handler", "Verifying captcha solved", {
    captchaType: state.captchaType,
    solved: state.solved,
  });

  const page = state.page;
  if (!page) {
    Logger.warn("captcha-handler", "No page available in state for verification");
    return {
      captchaType: "none",
      solved: true,
    };
  }

  const result = await detectCaptcha(page);

  if (result.detected) {
    Logger.info("captcha-handler", "Captcha still detected", { type: result.type });
    return {
      captchaType: result.type,
      solved: false,
    };
  }

  Logger.info("captcha-handler", "Captcha verification passed, no captcha detected");
  return {
    captchaType: "none",
    solved: true,
  };
}

export function shouldInterrupt(state: CaptchaStateType) {
  const shouldEnd = state.captchaType === "none" || state.solved;
  Logger.info("captcha-handler", "shouldInterrupt check", {
    captchaType: state.captchaType,
    solved: state.solved,
    decision: shouldEnd ? "end" : "interrupt",
  });
  if (shouldEnd) {
    return "end";
  }
  return "interrupt";
}

export function shouldVerify(state: CaptchaStateType) {
  const decision = state.solved ? "verify" : "interrupt";
  Logger.info("captcha-handler", "shouldVerify check", { solved: state.solved, decision });
  return decision;
}
