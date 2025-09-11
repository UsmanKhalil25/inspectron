import logging
from typing import Optional, Set
from collections import deque

import requests
from bs4 import BeautifulSoup, Tag

from utils.url import is_valid_url, make_absolute_url, normalize_url

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/91.0.4472.124 Safari/537.36"
    )
}

DEFAULT_MAX_PAGES = 100
DEFAULT_TIMEOUT = 5


class Crawler:
    def __init__(
        self,
        base_url: str,
        timeout: int = DEFAULT_TIMEOUT,
        max_pages: int = DEFAULT_MAX_PAGES,
        headers: Optional[dict] = None,
    ) -> None:

        self.base_url = normalize_url(base_url)

        if not is_valid_url(self.base_url):
            raise ValueError(f"Invalid base URL: {base_url}")

        self.timeout = timeout
        self.headers = headers
        self.max_pages = max_pages
        self.session = requests.Session()
        self.queue = deque([self.base_url])
        self.visited_urls: Set[str] = set()

        self.headers = headers or DEFAULT_HEADERS.copy()
        self.session.headers.update(self.headers)

    def _get_page_content(
        self, url: str, timeout: Optional[int] = None
    ) -> Optional[BeautifulSoup]:
        if not is_valid_url(url):
            logger.warning("Skipping invalid URL: %s", url)
            return None

        try:
            response = self.session.get(url, timeout=timeout or self.timeout)
            response.raise_for_status()
            logger.info("Fetched: %s", url)
            return BeautifulSoup(response.text, "html.parser")
        except requests.exceptions.RequestException as e:
            logger.error("Failed to fetch %s: %s", url, e)
            return None

    def _extract_links(self, soup: BeautifulSoup) -> list[str]:
        links: list[str] = []

        for link in soup.find_all("a", href=True):
            if not isinstance(link, Tag):
                continue

            href = link.get("href")
            href_values = [href] if isinstance(href, str) else href or []

            for h in href_values:
                if isinstance(h, str):
                    absolute_url = make_absolute_url(self.base_url, h.strip())
                    links.append(absolute_url)

        return links

    def run(self) -> list[str]:
        while self.queue and len(self.visited_urls) < self.max_pages:
            url = self.queue.pop()
            if url in self.visited_urls:
                continue

            logger.info("Visiting (%d/%d): %s", len(self.visited_urls) + 1, self.max_pages, url)
            self.visited_urls.add(url)
            soup = self._get_page_content(url)
            if not soup:
                continue

            for link in self._extract_links(soup):
                if link not in self.visited_urls:
                    self.queue.append(link)

        return list(self.visited_urls)
