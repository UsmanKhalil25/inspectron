#!/usr/bin/env node

import { Command } from "commander";
import { config } from "dotenv";
import { isValidUrl } from "./utils/url";
import { crawlWorkflow } from "./workflows";

config()

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

        try {
            await crawlWorkflow(url, parseInt(options.maxPages));
        } catch (err) {
            console.error("Error:", err);
            process.exit(1);
        }
    });

program.parse(process.argv);
