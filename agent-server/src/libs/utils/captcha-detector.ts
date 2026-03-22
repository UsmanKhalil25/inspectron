import { Page } from "playwright";

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
    console.error("Error detecting captcha:", error);
    return { detected: false, type: "none" };
  }
}
