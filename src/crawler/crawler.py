import logging
from typing import Optional, Set, List, Deque
from urllib.parse import urlparse
from collections import deque

from bs4 import BeautifulSoup, Tag
from playwright.sync_api import sync_playwright

from common.utils.url import is_valid_url, make_absolute_url, normalize_url
from common.utils.page_fetcher import PageFetcher
from common.constants import DEFAULT_TIMEOUT_MS, DEFAULT_MAX_PAGES, DEFAULT_HEADERS


logger = logging.getLogger(__name__)


class Crawler:
    def __init__(
        self,
        base_url: str,
        timeout_ms: int = DEFAULT_TIMEOUT_MS,
        max_pages: int = DEFAULT_MAX_PAGES,
        headers: Optional[dict] = None,
    ) -> None:
        self.base_url = normalize_url(base_url)

        if not is_valid_url(self.base_url):
            raise ValueError(f"Invalid base URL: {base_url}")
        parsed_url = urlparse(self.base_url)
        self.base_domain = parsed_url.netloc
        self.timeout_ms = timeout_ms
        self.max_pages = max_pages
        self.headers = headers or DEFAULT_HEADERS.copy()

        self.queue: Deque[str] = deque([self.base_url])
        self.visited_urls: Set[str] = set()
        self.failed_urls: Set[str] = set()

    def _should_crawl_url(self, url: str) -> bool:
        if not url:
            return False

        normalized_url = normalize_url(url)
        if not is_valid_url(normalized_url):
            return False

        if urlparse(normalized_url).netloc != self.base_domain:
            return False

        if normalized_url in self.visited_urls or normalized_url in self.queue:
            return False

        return True

    def _is_same_domain(self, url: str) -> bool:
        return urlparse(url).netloc == self.base_domain

    def _extract_links(self, soup: BeautifulSoup, base_url: str) -> list[str]:
        links: list[str] = []

        for link in soup.find_all("a", href=True):
            if not isinstance(link, Tag):
                continue

            href = link.get("href")
            href_values = [href] if isinstance(href, str) else href or []

            for h in href_values:
                if isinstance(h, str):
                    absolute_url = make_absolute_url(base_url, h.strip())
                    if self._is_same_domain(absolute_url):
                        links.append(absolute_url)
        return links

    def _crawl_with_playwright(self) -> List[str]:
        fetcher = PageFetcher(self.timeout_ms, self.headers)

        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            context = browser.new_context(extra_http_headers=self.headers)
            page = context.new_page()

            try:
                while self.queue and len(self.visited_urls) < self.max_pages:
                    current_url = self.queue.popleft()
                    if current_url in self.visited_urls:
                        continue
                    logger.info(
                        "Crawling (%d/%d): %s",
                        len(self.visited_urls) + 1,
                        self.max_pages,
                        current_url,
                    )

                    soup = fetcher.get_page(page, current_url, logger)

                    self.visited_urls.add(current_url)
                    if soup:
                        new_links = self._extract_links(soup, current_url)
                        for link in new_links:
                            if link not in self.visited_urls and link not in self.queue:
                                self.queue.append(link)
                    else:
                        self.failed_urls.add(current_url)
            finally:
                page.close()
                context.close()
                browser.close()
        return list(self.visited_urls)

    def run(self) -> List[str]:

        result = self._crawl_with_playwright()
        logger.info(
            "Crawl completed. Visited: %d, Failed: %d, Queued: %d",
            len(self.visited_urls),
            len(self.failed_urls),
            len(self.queue),
        )
        return result
