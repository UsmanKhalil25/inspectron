import type { Page } from "playwright";
import { BaseDetector } from "./base-detector";
import {
  VulnerabilityResult,
  VulnerabilitySeverity,
  VulnerabilityType,
} from "../types";

export class SecurityHeadersDetector extends BaseDetector {
  private readonly criticalHeaders = [
    {
      name: "Strict-Transport-Security",
      severity: VulnerabilitySeverity.HIGH,
      description: "Missing HSTS header",
      recommendation: "Add Strict-Transport-Security header",
    },
    {
      name: "X-Frame-Options",
      severity: VulnerabilitySeverity.MEDIUM,
      description: "Missing X-Frame-Options header",
      recommendation:
        "Add X-Frame-Options header to prevent clickjacking attacks",
    },
    {
      name: "X-Content-Type-Options",
      severity: VulnerabilitySeverity.MEDIUM,
      description: "Missing X-Content-Type-Options header",
      recommendation: "Add X-Content-Type-Options: nosniff header",
    },
    {
      name: "Content-Security-Policy",
      severity: VulnerabilitySeverity.HIGH,
      description: "Missing Content-Security-Policy header",
      recommendation: "Implement a strong Content Security Policy",
    },
    {
      name: "X-XSS-Protection",
      severity: VulnerabilitySeverity.LOW,
      description: "Missing X-XSS-Protection header",
      recommendation: "Add X-XSS-Protection header",
    },
  ];

  async detect(page: Page, url: string): Promise<VulnerabilityResult[]> {
    return this.safeExecute(async () => {
      const vulnerabilities: VulnerabilityResult[] = [];

      const response = await page.goto(url, { waitUntil: "domcontentloaded" });
      if (!response) return vulnerabilities;

      const headers = response.headers();

      for (const header of this.criticalHeaders) {
        const headerValue = headers[header.name.toLowerCase()];

        if (!headerValue) {
          vulnerabilities.push({
            type: VulnerabilityType.SECURITY_MISCONFIGURATION,
            severity: header.severity,
            url,
            description: header.description,
            recommendation: header.recommendation,
          });
        }
      }

      const protocol = new URL(url).protocol;
      if (protocol === "http:") {
        vulnerabilities.push({
          type: VulnerabilityType.CRYPTOGRAPHIC_FAILURES,
          severity: VulnerabilitySeverity.HIGH,
          url,
          description: "Site not using HTTPS",
          recommendation: "Enable HTTPS for all pages",
        });
      }

      return vulnerabilities;
    }, []);
  }
}
