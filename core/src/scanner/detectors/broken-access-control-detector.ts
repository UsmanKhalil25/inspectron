import type { Page } from "playwright";
import { BaseDetector } from "./base-detector";
import {
  VulnerabilityResult,
  VulnerabilitySeverity,
  VulnerabilityType,
} from "../types";

export class BrokenAccessControlDetector extends BaseDetector {
  private readonly sensitiveEndpoints = [
    "/admin",
    "/administrator",
    "/dashboard",
    "/panel",
    "/config",
    "/settings",
    "/user/edit",
    "/api/users",
    "/api/admin",
  ];

  async detect(page: Page, url: string): Promise<VulnerabilityResult[]> {
    return this.safeExecute(async () => {
      const vulnerabilities: VulnerabilityResult[] = [];

      await this.checkDirectoryListing(page, url, vulnerabilities);
      await this.checkExposedEndpoints(page, url, vulnerabilities);
      await this.checkCORS(page, url, vulnerabilities);

      return vulnerabilities;
    }, []);
  }

  private async checkDirectoryListing(
    page: Page,
    url: string,
    vulnerabilities: VulnerabilityResult[],
  ): Promise<void> {
    const content = await page.content();

    const directoryListingIndicators = [
      "Index of /",
      "Directory listing for",
      "Parent Directory",
      ">Name</a>",
      ">Size</a>",
      ">Last modified</a>",
    ];

    for (const indicator of directoryListingIndicators) {
      if (content.includes(indicator)) {
        vulnerabilities.push({
          type: VulnerabilityType.BROKEN_ACCESS_CONTROL,
          severity: VulnerabilitySeverity.MEDIUM,
          url,
          description: "Directory listing is enabled",
          evidence: `Found indicator: ${indicator}`,
          recommendation: "Disable directory listing on the web server",
        });
        break;
      }
    }
  }

  private async checkExposedEndpoints(
    page: Page,
    url: string,
    vulnerabilities: VulnerabilityResult[],
  ): Promise<void> {
    const baseUrl = new URL(url);

    for (const endpoint of this.sensitiveEndpoints) {
      try {
        const testUrl = `${baseUrl.origin}${endpoint}`;
        const response = await page.goto(testUrl, {
          waitUntil: "domcontentloaded",
          timeout: 5000,
        });

        if (response && response.status() === 200) {
          const content = await page.content();

          const hasAuthForm =
            content.includes('type="password"') || content.includes("login");

          if (!hasAuthForm) {
            vulnerabilities.push({
              type: VulnerabilityType.BROKEN_ACCESS_CONTROL,
              severity: VulnerabilitySeverity.HIGH,
              url: testUrl,
              description: `Sensitive endpoint accessible without authentication`,
              recommendation:
                "Implement proper authentication and authorization",
            });
          }
        }
      } catch {
        // Endpoint not accessible or timeout
      }
    }
  }

  private async checkCORS(
    page: Page,
    url: string,
    vulnerabilities: VulnerabilityResult[],
  ): Promise<void> {
    const response = await page.goto(url, { waitUntil: "domcontentloaded" });
    if (!response) return;

    const headers = response.headers();
    const corsHeader = headers["access-control-allow-origin"];

    if (corsHeader === "*") {
      vulnerabilities.push({
        type: VulnerabilityType.BROKEN_ACCESS_CONTROL,
        severity: VulnerabilitySeverity.MEDIUM,
        url,
        description: "Overly permissive CORS policy detected",
        evidence: "Access-Control-Allow-Origin: *",
        recommendation:
          "Restrict CORS to specific trusted domains instead of using wildcard",
      });
    }

    const corsCredentials = headers["access-control-allow-credentials"];
    if (corsHeader === "*" && corsCredentials === "true") {
      vulnerabilities.push({
        type: VulnerabilityType.BROKEN_ACCESS_CONTROL,
        severity: VulnerabilitySeverity.HIGH,
        url,
        description: "Dangerous CORS configuration",
        evidence: "Access-Control-Allow-Origin: * with credentials allowed",
        recommendation: "Never use wildcard CORS with credentials enabled",
      });
    }
  }
}
