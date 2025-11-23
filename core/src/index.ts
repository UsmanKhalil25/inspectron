#!/usr/bin/env node

import { Command } from "commander";
import { isValidUrl } from "./utils/url";
import { CrawlEngine } from "./crawl-engine"

const program = new Command();
program.argument("<url>", "URL given by user").action(async (url) => {
    if (!isValidUrl(url)) {
        console.error("Invalid URL. Please enter a valid URL.");
        process.exit(1);
    }
    const engine = new CrawlEngine(url, { headless: false });
    await engine.run();

});

program.parse(process.argv);
