import logging
import time
from playwright.async_api import Page

from crawler.core import StateManager, PageLoader, ElementDetector
from crawler.utils import NormalizedURL, URLBuilder


class CrawlEngine:
    def __init__(self, headless: bool = True):
        self.logger = logging.getLogger(__name__)
        self.state_manager = StateManager()
        self.element_detector = ElementDetector()
        self.page_loader = PageLoader(headless=headless)
        self._start_time: float | None = None
        self._end_time: float | None = None

    async def start(self) -> None:
        self.logger.info("Starting crawl engine")
        self._start_time = time.perf_counter()
        await self.page_loader.start()

    async def crawl(self, url: str) -> None:
        normalized_url = NormalizedURL(url)
        self.state_manager.add_url(normalized_url)

        while self.state_manager.has_unvisited_urls():
            next_url = self.state_manager.get_next_url()
            if not next_url:
                break

            self.logger.info("Visiting URL %s", next_url)
            try:
                page: Page = await self.page_loader.load(next_url.url)
            except RuntimeError as e:
                self.logger.exception(
                    "Failed to load URL %s error=%s", next_url, str(e)
                )
                continue
            self.state_manager.mark_visited(next_url)

            links = await self.element_detector.find_links(page)

            builder = URLBuilder(next_url, same_domain_only=True)
            for link in links:
                href = await link.get_attribute("href")
                if href:
                    built_url = builder.build(href)
                    if built_url:
                        self.state_manager.add_url(built_url)

    async def close(self) -> None:
        self._end_time = time.perf_counter()
        if self._start_time is not None:
            elapsed = self._end_time - self._start_time
            self.logger.info("Crawl engine ran for %.2f seconds", elapsed)

        self.logger.info("Shutting down crawl engine")
        await self.page_loader.close()
