import { interrupt } from "@langchain/langgraph";
import { AIMessage } from "@langchain/core/messages";
import type { MainGraphStateType } from "../../base/state";
import { Logger } from "../../../libs/utils";
import { BrowserManager } from "../../../libs";
import type { Page } from "playwright";
export interface CaptchaDetectionResult {
  detected: boolean;
  type: string;
}

export async function detectCaptcha(
  page: Page,
): Promise<CaptchaDetectionResult> {
  try {
    const recaptchaFrame = await page.$("iframe[src*='recaptcha']");
    if (recaptchaFrame) {
      return { detected: true, type: "reCAPTCHA" };
    }

    const hcaptchaFrame = await page.$("iframe[src*='hcaptcha']");
    if (hcaptchaFrame) {
      return { detected: true, type: "hCaptcha" };
    }

    const cloudflareChallenge = await page.$("#cf-challenge-running");
    if (cloudflareChallenge) {
      return { detected: true, type: "Cloudflare" };
    }

    const captchaElements = await page.$("[class*='captcha']");
    if (captchaElements) {
      return { detected: true, type: "Generic CAPTCHA" };
    }

    const title = await page.title();
    if (
      title.includes("Just a moment") ||
      title.includes("Attention Required")
    ) {
      return { detected: true, type: "Challenge Page" };
    }

    return { detected: false, type: "none" };
  } catch (error) {
    Logger.error("captcha-detector", "Error detecting captcha", error);
    return { detected: false, type: "none" };
  }
}

export async function detectCaptchaNode(_state: MainGraphStateType) {
  const page = await BrowserManager.getPage();
  if (!page) {
    Logger.warn("captcha", "No page available");
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

  return {
    captchaType: result.type,
    solved: false,
  };
}

export function handleInterruptNode(state: MainGraphStateType) {
  const captchaType = state.captchaType || "Unknown";

  const userConfirmation: unknown = interrupt({
    action_requests: [
      {
        name: "solve_captcha",
        args: {
          captchaType,
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

  Logger.info("captcha", "Received user confirmation", userConfirmation);

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

  Logger.info("captcha", "Captcha solved status", { solved });

  return { solved };
}

export async function verifySolvedNode(state: MainGraphStateType) {
  Logger.info("captcha", "Verifying captcha solved", {
    captchaType: state.captchaType,
    solved: state.solved,
  });

  const page = await BrowserManager.getPage();
  if (!page) {
    Logger.warn("captcha", "No page available for verification");
    return {
      captchaType: "none",
      solved: true,
    };
  }

  const result = await detectCaptcha(page);

  if (result.detected) {
    Logger.info("captcha", "Captcha still detected", {
      type: result.type,
    });
    return {
      captchaType: result.type,
      solved: false,
    };
  }

  Logger.info("captcha", "Captcha verification passed, no captcha detected");

  const successMessage = new AIMessage(
    "Captcha has been successfully solved and verified. The page is now accessible. Continue with the user's task without mentioning captcha again.",
  );

  return {
    captchaType: "none",
    solved: true,
    messages: [successMessage],
  };
}

export function shouldInterrupt(state: MainGraphStateType) {
  const shouldEnd = state.captchaType === "none" || state.solved;
  Logger.info("captcha", "shouldInterrupt check", {
    captchaType: state.captchaType,
    solved: state.solved,
    decision: shouldEnd ? "end" : "interrupt",
  });
  if (shouldEnd) {
    return "end";
  }
  return "interrupt";
}

export function shouldVerify(state: MainGraphStateType) {
  const decision = state.solved ? "verify" : "interrupt";
  Logger.info("captcha", "shouldVerify check", {
    solved: state.solved,
    decision,
  });
  return decision;
}
