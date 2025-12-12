import { tool } from "@langchain/core/tools";
import * as z from "zod";

import { AgentStateType } from "./state.js";
import { BrowserFactory } from "./factory/browser-factory.js";
import { vulnerabilityScannerGraph } from "./subgraphs/vulnerability-scanner.js";
import {
  VulnerabilityReportSchema,
  VulnerabilitySeverityType,
} from "./types/vulnerability.js";

const DEFAULT_WAIT_MS = 500;
export const click = (state: AgentStateType) =>
  tool(
    async ({ elementId }) => {
      const page = state.page?.mouse
        ? state.page
        : await BrowserFactory.getPage();
      const interactiveElements = state.interactiveElements || [];

      const element = interactiveElements.find((el) => el.id === elementId);
      if (!element) {
        return `Error: no element with id ${elementId}`;
      }

      const { x, y, width, height } = element.boundingBox;
      await page.mouse.click(x + width / 2, y + height / 2);
      await page.waitForTimeout(DEFAULT_WAIT_MS);
      return `Clicked element ${elementId}`;
    },
    {
      name: "click",
      description: "Click on a labeled element by its ID number",
      schema: z.object({
        elementId: z
          .number()
          .describe("The ID number of the labeled element to click"),
      }),
    },
  );

export const type = (state: AgentStateType) =>
  tool(
    async ({ elementId, text }) => {
      const page = state.page?.mouse
        ? state.page
        : await BrowserFactory.getPage();
      const interactiveElements = state.interactiveElements || [];
      const element = interactiveElements.find((el) => el.id === elementId);
      if (!element) {
        return `Error: no element with id ${elementId}`;
      }

      const { x, y, width, height } = element.boundingBox;
      await page.mouse.click(x + width / 2, y + height / 2);
      const selectAll = process.platform === "darwin" ? "Meta+A" : "Control+A";
      await page.keyboard.press(selectAll);
      await page.keyboard.press("Backspace");
      await page.keyboard.type(text);
      await page.waitForTimeout(DEFAULT_WAIT_MS);
      return `Typed "${text}" into element ${elementId}`;
    },
    {
      name: "type",
      description: "Type text into a labeled input element",
      schema: z.object({
        elementId: z
          .number()
          .describe("The ID number of the labeled input element"),
        text: z.string().describe("The text to type"),
      }),
    },
  );

export const scroll = (state: AgentStateType) =>
  tool(
    async ({ direction, amount = 500 }) => {
      const page = state.page?.mouse
        ? state.page
        : await BrowserFactory.getPage();
      let deltaX = 0;
      let deltaY = 0;

      switch (direction) {
        case "up":
          deltaY = -amount;
          break;
        case "down":
          deltaY = amount;
          break;
        case "left":
          deltaX = -amount;
          break;
        case "right":
          deltaX = amount;
          break;
      }

      await page.mouse.wheel(deltaX, deltaY);
      await page.waitForTimeout(DEFAULT_WAIT_MS);
      return `Scrolled ${direction} by ${amount} pixels`;
    },
    {
      name: "scroll",
      description: "Scroll the page in a given direction",
      schema: z.object({
        direction: z
          .enum(["up", "down", "left", "right"])
          .describe("Direction to scroll"),
        amount: z
          .number()
          .optional()
          .describe("Amount to scroll in pixels (default: 500)"),
      }),
    },
  );

export const navigate = (state: AgentStateType) =>
  tool(
    async ({ url }) => {
      const page = state.page?.goto
        ? state.page
        : await BrowserFactory.getPage();
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(DEFAULT_WAIT_MS);
      return `Navigated to ${url}`;
    },
    {
      name: "navigate",
      description: "Navigate to a specified URL",
      schema: z.object({
        url: z.string().describe("The URL to navigate to"),
      }),
    },
  );

export const wait = (state: AgentStateType) =>
  tool(
    async ({ milliseconds }) => {
      const page = state.page?.waitForLoadState
        ? state.page
        : await BrowserFactory.getPage();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(milliseconds);

      return `Waited for ${milliseconds}ms`;
    },
    {
      name: "wait",
      description: "Wait for a specified amount of time in milliseconds",
      schema: z.object({
        milliseconds: z.number().describe("Time to wait in milliseconds"),
      }),
    },
  );

export const goBack = (state: AgentStateType) =>
  tool(
    async () => {
      const page = state.page?.goBack
        ? state.page
        : await BrowserFactory.getPage();
      await page.goBack();
      return "Navigated back to the previous page";
    },
    {
      name: "go_back",
      description: "Navigate back to the previous page in browser history",
      schema: z.object({}),
    },
  );

export const scanVulnerabilities = (state: AgentStateType) =>
  tool(
    async () => {
      const page = state.page?.url ? state.page : await BrowserFactory.getPage();

      if (!page) {
        return "Error: No active page to scan";
      }

      const url = page.url();

      console.log(`[Vulnerability Scanner Tool] Starting scan for ${url}`);

      try {
        // Invoke the vulnerability scanner subgraph
        const result = await vulnerabilityScannerGraph.invoke({
          url,
          vulnerabilities: [],
          scanComplete: false,
        });

        const vulnerabilities = result.vulnerabilities || [];
        const summary = {
          total: vulnerabilities.length,
          critical: vulnerabilities.filter((v) => v.severity === "critical")
            .length,
          high: vulnerabilities.filter((v) => v.severity === "high").length,
          medium: vulnerabilities.filter((v) => v.severity === "medium").length,
          low: vulnerabilities.filter((v) => v.severity === "low").length,
        };

        // Determine overall risk level
        let riskLevel: VulnerabilitySeverityType = "low";
        if (summary.critical > 0) {
          riskLevel = "critical";
        } else if (summary.high > 0) {
          riskLevel = "high";
        } else if (summary.medium > 0) {
          riskLevel = "medium";
        }

        const report = {
          findings: vulnerabilities,
          scannedAt: new Date().toISOString(),
          url,
          riskLevel,
          summary,
        };

        console.log(
          `[Vulnerability Scanner Tool] Scan complete. Found ${summary.total} vulnerabilities (Critical: ${summary.critical}, High: ${summary.high}, Medium: ${summary.medium}, Low: ${summary.low})`
        );

        // Return a formatted summary for the agent
        if (vulnerabilities.length === 0) {
          return `Vulnerability scan complete for ${url}. No vulnerabilities detected.`;
        }

        let resultText = `Vulnerability scan complete for ${url}.\n\n`;
        resultText += `Total vulnerabilities found: ${summary.total}\n`;
        resultText += `Overall risk level: ${riskLevel.toUpperCase()}\n\n`;
        resultText += `Breakdown:\n`;
        if (summary.critical > 0)
          resultText += `- Critical: ${summary.critical}\n`;
        if (summary.high > 0) resultText += `- High: ${summary.high}\n`;
        if (summary.medium > 0) resultText += `- Medium: ${summary.medium}\n`;
        if (summary.low > 0) resultText += `- Low: ${summary.low}\n`;

        resultText += `\nTop findings:\n`;
        vulnerabilities.slice(0, 5).forEach((vuln, index) => {
          resultText += `${index + 1}. [${vuln.severity.toUpperCase()}] ${vuln.title}\n`;
        });

        if (vulnerabilities.length > 5) {
          resultText += `... and ${vulnerabilities.length - 5} more\n`;
        }

        // Store the full report in state for UI display
        state.vulnerabilityReport = report;

        return resultText;
      } catch (error) {
        console.error("[Vulnerability Scanner Tool] Error during scan:", error);
        return `Error scanning for vulnerabilities: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
    {
      name: "scan_vulnerabilities",
      description:
        "Scan the current webpage for passive security vulnerabilities including missing security headers, insecure cookies, and exposed secrets. Use this when analyzing security of web applications or when explicitly requested by the user.",
      schema: z.object({}),
    }
  );
