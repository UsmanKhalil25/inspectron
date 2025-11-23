import { chromium, Browser, Page } from "playwright";

export class PageLoader {
    private browser!: Browser;
    private page!: Page;

    constructor(private headless: boolean = true) { }

    async start(): Promise<void> {
        this.browser = await chromium.launch({
            headless: this.headless
        });
        this.page = await this.browser.newPage();
    }

    async load(url: string): Promise<void> {
        if (!this.page) {
            throw new Error("Page not initialized. Call start() first.");
        }
        await this.page.goto(url);
        console.log(`Loaded URL: ${url}`);
    }

    async close(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            console.log("Browser closed");
        }
    }
}

