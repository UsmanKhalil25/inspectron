import type { Page } from "playwright";
import { BaseDetector } from "./base-detector";
import {
  VulnerabilityResult,
  VulnerabilitySeverity,
  VulnerabilityType,
} from "../types";

export class BrokenAuthDetector extends BaseDetector {
  async detect(page: Page, url: string): Promise<VulnerabilityResult[]> {
    return this.safeExecute(async () => {
      const vulnerabilities: VulnerabilityResult[] = [];

      await this.checkPasswordFields(page, url, vulnerabilities);
      await this.checkSessionCookies(page, url, vulnerabilities);

      return vulnerabilities;
    }, []);
  }

  private async checkPasswordFields(
    page: Page,
    url: string,
    vulnerabilities: VulnerabilityResult[],
  ): Promise<void> {
    const passwordFields = await page.$$(
      'input[type="password"], input[name*="password" i], input[name*="pass" i]',
    );

    for (const field of passwordFields) {
      const autocomplete = await field.getAttribute("autocomplete");
      const form = await field.evaluateHandle((el) => el.closest("form"));

      if (autocomplete === "on" || !autocomplete) {
        vulnerabilities.push({
          type: VulnerabilityType.IDENTIFICATION_FAILURES,
          severity: VulnerabilitySeverity.MEDIUM,
          url,
          description:
            "Password field allows autocomplete or lacks autocomplete attribute",
          recommendation:
            'Set autocomplete="new-password" or "current-password" on password fields',
        });
      }

      if (form) {
        const action = await form.evaluate((f) =>
          f ? (f as HTMLFormElement).action : "",
        );
        if (action && action.startsWith("http:")) {
          vulnerabilities.push({
            type: VulnerabilityType.CRYPTOGRAPHIC_FAILURES,
            severity: VulnerabilitySeverity.CRITICAL,
            url,
            description: "Password form submits over insecure HTTP",
            evidence: `Form action: ${action}`,
            recommendation:
              "Always use HTTPS for forms containing sensitive data",
          });
        }
      }
    }
  }

  private async checkSessionCookies(
    page: Page,
    url: string,
    vulnerabilities: VulnerabilityResult[],
  ): Promise<void> {
    const cookies = await page.context().cookies();

    for (const cookie of cookies) {
      if (
        cookie.name.toLowerCase().includes("session") ||
        cookie.name.toLowerCase().includes("auth") ||
        cookie.name.toLowerCase().includes("token")
      ) {
        if (!cookie.secure) {
          vulnerabilities.push({
            type: VulnerabilityType.IDENTIFICATION_FAILURES,
            severity: VulnerabilitySeverity.HIGH,
            url,
            description: `Session cookie '${cookie.name}' missing Secure flag`,
            recommendation: "Set Secure flag on all session cookies",
          });
        }

        if (!cookie.httpOnly) {
          vulnerabilities.push({
            type: VulnerabilityType.IDENTIFICATION_FAILURES,
            severity: VulnerabilitySeverity.HIGH,
            url,
            description: `Session cookie '${cookie.name}' missing HttpOnly flag`,
            recommendation:
              "Set HttpOnly flag to prevent JavaScript access to cookies",
          });
        }

        if (cookie.sameSite === "None" || !cookie.sameSite) {
          vulnerabilities.push({
            type: VulnerabilityType.IDENTIFICATION_FAILURES,
            severity: VulnerabilitySeverity.MEDIUM,
            url,
            description: `Session cookie '${cookie.name}' missing or weak SameSite attribute`,
            recommendation: "Set SameSite=Strict or SameSite=Lax on cookies",
          });
        }
      }
    }
  }
}
