import type { Page } from "playwright";
import { BaseDetector } from "./base-detector";
import {
  VulnerabilityResult,
  VulnerabilitySeverity,
  VulnerabilityType,
} from "../types";

export class SensitiveDataDetector extends BaseDetector {
  private readonly sensitivePatterns = [
    {
      pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
      name: "Social Security Number",
    },
    {
      pattern: /\b\d{16}\b/g,
      name: "Credit Card Number",
    },
    {
      pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      name: "Email Address",
    },
    {
      pattern: /\b(?:\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}\b/g,
      name: "Phone Number",
    },
    {
      pattern: /\bapi[_-]?key\s*[:=]\s*['"]?[\w-]{20,}['"]?/gi,
      name: "API Key",
    },
    {
      pattern: /\bpassword\s*[:=]\s*['"][\w!@#$%^&*(),.?":{}|<>]{4,}['"]?/gi,
      name: "Password in Code",
    },
  ];

  async detect(page: Page, url: string): Promise<VulnerabilityResult[]> {
    return this.safeExecute(async () => {
      const vulnerabilities: VulnerabilityResult[] = [];

      const content = await page.content();

      for (const { pattern, name } of this.sensitivePatterns) {
        const matches = content.match(pattern);
        if (matches && matches.length > 0) {
          const isInComment = this.isInHtmlComment(content, matches[0]);

          if (!isInComment) {
            vulnerabilities.push({
              type: VulnerabilityType.CRYPTOGRAPHIC_FAILURES,
              severity: VulnerabilitySeverity.HIGH,
              url,
              description: `Potential ${name} exposed in page content`,
              evidence: `Found ${matches.length} match(es)`,
              recommendation:
                "Remove sensitive data from page source, use server-side processing",
            });
          }
        }
      }

      const scripts = await page.$$("script");
      for (const script of scripts) {
        const scriptContent = await script.textContent();
        if (!scriptContent) continue;

        if (
          scriptContent.includes("localStorage") ||
          scriptContent.includes("sessionStorage")
        ) {
          for (const { pattern, name } of this.sensitivePatterns) {
            if (pattern.test(scriptContent)) {
              vulnerabilities.push({
                type: VulnerabilityType.CRYPTOGRAPHIC_FAILURES,
                severity: VulnerabilitySeverity.HIGH,
                url,
                description: `Potential ${name} stored in browser storage`,
                recommendation:
                  "Avoid storing sensitive data in localStorage or sessionStorage",
              });
            }
          }
        }
      }

      return vulnerabilities;
    }, []);
  }

  private isInHtmlComment(content: string, match: string): boolean {
    const index = content.indexOf(match);
    if (index === -1) return false;

    const beforeMatch = content.substring(0, index);
    const lastCommentStart = beforeMatch.lastIndexOf("<!--");
    const lastCommentEnd = beforeMatch.lastIndexOf("-->");

    return lastCommentStart > lastCommentEnd;
  }
}
