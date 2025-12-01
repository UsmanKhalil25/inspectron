#!/usr/bin/env node

import { Command } from "commander";
import { isValidUrl } from "./utils/url";
import { CrawlEngine } from "./crawler";
import { ScannerEngine } from "./scanner";

const program = new Command();

program
  .command("crawl")
  .description("Crawl a website and discover all pages")
  .argument("<url>", "URL to crawl")
  .option("--headless", "Run browser in headless mode", true)
  .action(async (url, options) => {
    if (!isValidUrl(url)) {
      console.error("Invalid URL. Please enter a valid URL.");
      process.exit(1);
    }
    const engine = new CrawlEngine(url, { headless: options.headless });
    await engine.run();
  });

program
  .command("scan")
  .description("Scan a website for vulnerabilities")
  .argument("<url>", "URL to scan")
  .option("--headless", "Run browser in headless mode", true)
  .action(async (url, options) => {
    if (!isValidUrl(url)) {
      console.error("Invalid URL. Please enter a valid URL.");
      process.exit(1);
    }
    const scanner = new ScannerEngine(url, { headless: options.headless });
    const result = await scanner.scan();

    console.log("\n========== SCAN RESULTS ==========");
    console.log(`URL: ${result.url}`);
    console.log(`Scanned at: ${result.scannedAt.toISOString()}`);
    console.log(`Duration: ${result.duration}ms`);
    console.log(
      `Total vulnerabilities found: ${result.vulnerabilities.length}`,
    );

    if (result.vulnerabilities.length > 0) {
      console.log("\n========== VULNERABILITIES ==========");
      result.vulnerabilities.forEach((vuln, index) => {
        console.log(`\n[${index + 1}] ${vuln.description}`);
        console.log(`    Type: ${vuln.type}`);
        console.log(`    Severity: ${vuln.severity}`);
        console.log(`    URL: ${vuln.url}`);
        if (vuln.evidence) {
          console.log(`    Evidence: ${vuln.evidence}`);
        }
        if (vuln.recommendation) {
          console.log(`    Recommendation: ${vuln.recommendation}`);
        }
      });
    } else {
      console.log("\nNo vulnerabilities detected.");
    }

    console.log("\n========== END OF REPORT ==========");
  });

program.parse(process.argv);
