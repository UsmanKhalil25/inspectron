import logging
import time
from typing import List

from playwright.async_api import Page
from dotenv import load_dotenv

from crawler.core import (
    StateManager,
    PageLoader,
    ElementDetector,
    ElementLabeler,
)
from crawler.utils import NormalizedURL, URLBuilder


class CrawlEngine:
    def __init__(self, headless: bool = False):
        load_dotenv()

        self.logger = logging.getLogger(__name__)
        self.state_manager = StateManager()
        self.element_detector = ElementDetector()
        self.element_labeler = ElementLabeler()
        self.page_loader = PageLoader(headless=headless)

        self._start_time: float | None = None
        self._end_time: float | None = None
        self._url_count: int = 0

    async def start(self) -> None:
        self.logger.info("Starting crawl engine")
        self._start_time = time.perf_counter()
        await self.page_loader.start()

    async def crawl(self, url: str) -> List[str]:
        normalized_url = NormalizedURL(url)
        self.state_manager.add_url(normalized_url)

        while self.state_manager.has_unvisited_urls():
            self._url_count += 1
            next_url = self.state_manager.get_next_url()
            if not next_url:
                break

            page = await self._load_page(next_url)
            if not page:
                continue

            self.state_manager.mark_visited(next_url)

            links = await self.element_detector.find_links(page)

            await self._extract_and_enqueue_links(next_url, links)

        return [
            visited_url.url for visited_url in self.state_manager.get_visited_urls()
        ]

    async def _load_page(self, url: NormalizedURL) -> Page | None:
        self.logger.info("Visiting URL %s", url)
        try:
            return await self.page_loader.load(url.url)
        except RuntimeError as e:
            self.logger.exception("Failed to load URL %s error=%s", url, str(e))
            return None

    async def _extract_and_enqueue_links(self, base_url: NormalizedURL, links) -> None:
        builder = URLBuilder(base_url, same_domain_only=True)

        for link in links:
            href = await link.get_attribute("href")
            if not href:
                continue

            built_url = builder.build(href)
            if not built_url:
                continue

            self.state_manager.add_url(built_url)

    async def close(self) -> None:
        self.logger.info("Shutting down crawl engine")
        await self.page_loader.close()

        self._end_time = time.perf_counter()
        if self._start_time:
            elapsed = self._end_time - self._start_time
            self.logger.info("Crawl engine ran for %.2f seconds", elapsed)

        self.logger.info("URL count %s", self._url_count)
