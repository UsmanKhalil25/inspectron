from logging import Logger
from typing import Optional

from bs4 import BeautifulSoup
from playwright.sync_api import Page, TimeoutError as PlaywrightTimeoutError


class PageFetcher:
    def __init__(self, timeout_ms: int, headers: dict):
        self.timeout_ms = timeout_ms
        self.headers = headers

    def get_page(self, page: Page, url: str, logger: Logger) -> Optional[BeautifulSoup]:
        try:
            page.goto(url, timeout=self.timeout_ms, wait_until="domcontentloaded")
            page_content = page.content()
            logger.info("Successfully fetched: %s", url)
            return BeautifulSoup(page_content, "html.parser")
        except PlaywrightTimeoutError:
            logger.warning("Timeout while fetching %s", url)
        return None
