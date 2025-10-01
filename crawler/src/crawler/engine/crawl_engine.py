from typing import Optional
from playwright.async_api import Page
from crawler.core import StateManager, PageLoader, ElementDetector


class CrawlEngine:
    def __init__(self, headless: bool = True):
        self.state_manager = StateManager()
        self.element_detector = ElementDetector()
        self.page_loader = PageLoader(headless=headless)

    async def start(self) -> None:
        await self.page_loader.start()

    async def crawl(self, url: str) -> None:
        self.state_manager.add_url(url)

        while self.state_manager.has_unvisited_urls():
            next_url: Optional[str] = self.state_manager.get_next_url()
            if not next_url:
                break

            page: Page = await self.page_loader.load(next_url)
            self.state_manager.mark_visited(next_url)

            links = await self.element_detector.find_links(page)
            for link in links:
                href = await link.get_attribute("href")
                if href:
                    self.state_manager.add_url(href)

    async def close(self) -> None:
        await self.page_loader.close()

