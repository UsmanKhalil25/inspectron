import type { Page } from "playwright";
import { BaseDetector } from "./base-detector";
import {
  VulnerabilityResult,
  VulnerabilitySeverity,
  VulnerabilityType,
} from "../types";

export class InjectionDetector extends BaseDetector {
  private readonly sqlErrorPatterns = [
    /SQL syntax.*?error/i,
    /mysqli?_/i,
    /ORA-\d{5}/i,
    /PostgreSQL.*?ERROR/i,
    /Warning.*?mysql/i,
    /SQLSTATE/i,
    /syntax error/i,
    /invalid query/i,
  ];

  private readonly xssTestPayloads = [
    "<script>alert('XSS')</script>",
    "javascript:alert('XSS')",
    "<img src=x onerror=alert('XSS')>",
  ];

  async detect(page: Page, url: string): Promise<VulnerabilityResult[]> {
    const vulnerabilities: VulnerabilityResult[] = [];

    const sqlVulnerabilities = await this.detectSQLInjection(page, url);
    const xssVulnerabilities = await this.detectXSS(page, url);

    return [...sqlVulnerabilities, ...xssVulnerabilities];
  }

  private async detectSQLInjection(
    page: Page,
    url: string,
  ): Promise<VulnerabilityResult[]> {
    return this.safeExecute(async () => {
      const vulnerabilities: VulnerabilityResult[] = [];
      const forms = await page.$$("form");

      for (const form of forms) {
        const inputs = await form.$$("input, textarea");

        for (const input of inputs) {
          const type = await input.getAttribute("type");
          if (type === "submit" || type === "button") continue;

          await input.fill("' OR '1'='1");

          const content = await page.content();

          for (const pattern of this.sqlErrorPatterns) {
            if (pattern.test(content)) {
              vulnerabilities.push({
                type: VulnerabilityType.INJECTION,
                severity: VulnerabilitySeverity.HIGH,
                url,
                description: "Potential SQL Injection vulnerability detected",
                evidence: `SQL error pattern found: ${pattern.source}`,
                recommendation:
                  "Use parameterized queries or prepared statements",
              });
              break;
            }
          }
        }
      }

      return vulnerabilities;
    }, []);
  }

  private async detectXSS(
    page: Page,
    url: string,
  ): Promise<VulnerabilityResult[]> {
    return this.safeExecute(async () => {
      const vulnerabilities: VulnerabilityResult[] = [];
      const forms = await page.$$("form");

      for (const form of forms) {
        const inputs = await form.$$("input, textarea");

        for (const input of inputs) {
          const type = await input.getAttribute("type");
          if (type === "submit" || type === "button") continue;

          for (const payload of this.xssTestPayloads) {
            await input.fill(payload);

            const content = await page.content();

            if (content.includes(payload)) {
              vulnerabilities.push({
                type: VulnerabilityType.INJECTION,
                severity: VulnerabilitySeverity.HIGH,
                url,
                description:
                  "Potential Cross-Site Scripting (XSS) vulnerability detected",
                evidence: `Payload reflected in response: ${payload}`,
                recommendation:
                  "Sanitize and encode user input before rendering",
              });
              break;
            }
          }
        }
      }

      return vulnerabilities;
    }, []);
  }
}
