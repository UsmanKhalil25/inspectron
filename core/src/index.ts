#!/usr/bin/env node

import { ChatOpenAI } from "@langchain/openai";
import { Command } from "commander";
import { config } from "dotenv";

import { BrowserService } from "./services/browser-service";
import { CrawlStateService } from "./services/crawl-state-service";
import { isValidUrl } from "./utils/url";
import { CrawlWorkflow } from "./workflows/crawl";

config();

const program = new Command();

program
  .command("crawl")
  .description("Crawl a website and discover all pages")
  .argument("<url>", "URL to crawl")
  .option("--max-pages <number>", "Maximum pages to visit", "5")
  .action(async (url, options) => {
    if (!isValidUrl(url)) {
      console.error("Invalid URL. Please enter a valid URL.");
      process.exit(1);
    }

    const llm = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0,
    });

    const browserService = new BrowserService();
    await browserService.launch();

    const crawlStateService = new CrawlStateService({ baseUrl: url });

    const workflow = new CrawlWorkflow(llm, browserService, crawlStateService);

    try {
      await workflow.execute();
    } catch (err) {
      console.error("Error:", err);
      process.exit(1);
    } finally {
      await browserService.close();
    }
  });

program.parse(process.argv);
