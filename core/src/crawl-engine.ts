import { StateManager } from "./state-manager";
import { PageLoader } from "./page-loader";

type CrawlConfig = {
    headless?: boolean;
};

export class CrawlEngine {
    private readonly stateManager = new StateManager();
    private readonly pageLoader: PageLoader;

    constructor(
        private readonly baseUrl: string,
        { headless = true }: CrawlConfig = {}
    ) {
        this.pageLoader = new PageLoader(headless);
    }

    async run() {
        await this.pageLoader.start();
        await this.pageLoader.load(this.baseUrl);
        await this.pageLoader.close();
    }
}

