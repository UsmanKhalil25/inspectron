#!/usr/bin/env node

import { Command } from "commander";
import { isValidUrl } from "./utils/url";

const program = new Command();
program.argument("<url>", "URL given by user").action((url) => {
  if (!isValidUrl(url)) {
    console.error("Invalid URL. Please enter a valid URL.");
    process.exit(1);
  }

  console.log({ url });
});

program.parse(process.argv);
