import { StateManager } from "./state-manager";
import { PageLoader } from "./page-loader";
import { Scraper } from "./scraper";
import { ElementLabeler } from "./element-labeler";

import { parseAndNormalize } from "../utils/url";

type CrawlConfig = {
  headless?: boolean;
};

export class CrawlEngine {
  private readonly stateManager = new StateManager();
  private readonly pageLoader: PageLoader;
  private readonly baseHostname: string;

  constructor(
    private readonly baseUrl: string,
    { headless = true }: CrawlConfig = {},
  ) {
    this.pageLoader = new PageLoader(headless);
    this.baseHostname = new URL(baseUrl).hostname.toLowerCase();
  }

  async run() {
    await this.pageLoader.start();

    this.stateManager.addUrl(parseAndNormalize(this.baseUrl));

    while (!this.stateManager.isEmpty()) {
      const url = this.stateManager.getNextUrl();
      if (!url) break;

      try {
        const page = await this.pageLoader.load(url);
        console.log(`Visited: ${url}`);
        this.stateManager.markVisited(parseAndNormalize(url));

        const linkElements = await Scraper.findLinks(page);

        const labeledElements = await ElementLabeler.labelElements(
          page,
          linkElements,
        );
        console.log({ labeledElements });

        for (const el of linkElements) {
          const hrefHandle = await el.getAttribute("href");
          if (!hrefHandle) continue;

          const absoluteUrl = new URL(hrefHandle, url).toString();

          if (
            new URL(absoluteUrl).hostname.toLowerCase() !== this.baseHostname
          ) {
            continue;
          }

          this.stateManager.addUrl(parseAndNormalize(absoluteUrl));
        }
      } catch (err) {
        console.error(`Failed to load ${url}:`, err);
      }
    }

    await this.pageLoader.close();
    console.log("Crawling finished!");
  }
}
