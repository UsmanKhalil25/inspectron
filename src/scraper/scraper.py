import logging
from typing import Optional, Iterable

from bs4 import BeautifulSoup, Tag
from playwright.sync_api import sync_playwright

from .models.scraped_url import ScrapedUrl
from .constants import DEFAULT_TIMEOUT_MS, DEFAULT_HEADERS


from common.utils.page_fetcher import PageFetcher


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class Scraper:

    def __init__(
        self,
        timeout_ms: int = DEFAULT_TIMEOUT_MS,
        headers: Optional[dict] = None,
    ) -> None:
        self.timeout_ms = timeout_ms
        self.headers = headers or DEFAULT_HEADERS.copy()

    def _get_title(self, soup: BeautifulSoup) -> Optional[str]:
        title = soup.find("title")
        return title.get_text(strip=True) if title else None

    def _get_meta_description(self, soup: BeautifulSoup) -> Optional[str]:
        meta = soup.find("meta", attrs={"name": "description"})
        if not isinstance(meta, Tag):
            return None

        content = meta.get("content")
        if not isinstance(content, str):
            return None

        return content.strip()

    def _scrape_with_playwright(self, urls: Iterable[str]) -> list[ScrapedUrl]:
        results: list[ScrapedUrl] = []
        fetcher = PageFetcher(self.timeout_ms, self.headers)

        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            page = browser.new_page()
            try:
                for url in urls:
                    soup = fetcher.get_page(page, url, logger)
                    if not soup:
                        continue

                    scraped = ScrapedUrl(
                        url=url,
                        title=self._get_title(soup),
                        meta_description=self._get_meta_description(soup),
                        html=soup.prettify(),
                    )
                    results.append(scraped)
            finally:
                page.close()
                browser.close()

        return results

    def run(self, urls: Iterable[str]) -> list[ScrapedUrl]:
        return self._scrape_with_playwright(urls)

