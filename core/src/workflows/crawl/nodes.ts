import { LabelingService } from "../../services/labeling-service";
import { CrawlState } from "./state";

export async function navigateNode(state: CrawlState) {
    const { crawlStateService, browserService } = state;
    const nextUrl = crawlStateService.getNextUrl();

    if (!nextUrl) {
        return { url: null };
    }

    await browserService.navigate(nextUrl);
    return { url: nextUrl };
}

export async function captureAndLabelNode(state: CrawlState) {
    const { browserService, url } = state;

    if (!url) {
        return {};
    }

    const page = browserService.getPage();
    const links = await browserService.getLinks();
    await LabelingService.labelElements(page, links);

    const screenshot = await browserService.screenshot();

    return {
        screenshot,
        elements: links,
    };
}

export async function agentDecideNode(state: CrawlState) {
    const { screenshot, elements, agent } = state;

    if (!screenshot) {
        throw new Error("No screenshot available");
    }

    await agent.decide(screenshot, elements);

    return {};
}

export async function checkNavigationNode(state: CrawlState) {
    const { browserService, crawlStateService, url, elements } = state;
    const page = browserService.getPage();

    await page.evaluate(() => {
        const labels = document.querySelectorAll(
            'div[style*="border: 2px dashed red"]',
        );
        labels.forEach((label) => label.remove());
    });

    if (!url) return;

    const discoveredLinks = elements
        .filter((el) => el.tag === "a")
        .map((el) => {
            const href = page.evaluate((text) => {
                const link = Array.from(document.querySelectorAll("a")).find(
                    (a) => a.innerText.trim() === text,
                );
                return link?.href || null;
            }, el.text);
            return href;
        });

    const resolvedLinks = await Promise.all(discoveredLinks);
    const validLinks = resolvedLinks.filter((link) => link !== null) as string[];

    crawlStateService.markUrlCrawled(url, validLinks);
}

export function shouldContinue(state: CrawlState) {
    const { crawlStateService } = state;
    const pendingUrls = crawlStateService.getPendingUrls();
    return pendingUrls.length > 0 ? "continue" : "end";
}
