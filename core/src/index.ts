#!/usr/bin/env node

import { Command } from "commander";
import { isValidUrl } from "./utils/url";

import { BrowserService, LabelingService } from "./services";

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

    const browser = new BrowserService();

    try {
      console.log("Launching browser...");
      await browser.launch();

      console.log(`Navigating to ${url}...`);
      await browser.navigate(url);

      console.log("Extracting interactive elements...");
      const elements = await browser.getInteractiveElements();

      const interactive = await browser.getInteractiveElements();
      await LabelingService.labelElements(browser.getPage(), interactive);

      console.log(`Found ${elements.length} interactive elements`);
      console.log(elements);

      console.log("Capturing screenshot...");
      const buffer = await browser.screenshot();

      // Save screenshot
      const fs = await import("fs");
      fs.writeFileSync("screenshot.png", buffer);
      console.log("Screenshot saved as screenshot.png");
    } catch (err) {
      console.error("Error:", err);
    } finally {
      console.log("Closing browser...");
      await browser.close();
    }
  });

program.parse(process.argv);
