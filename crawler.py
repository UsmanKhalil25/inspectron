import logging
from typing import Optional

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


class Crawler:
    def __init__(
        self, base_url: str, timeout: int = 10, headers: Optional[dict] = None
    ) -> None:

        self.base_url = normalize_url(base_url)
        if not is_valid_url(self.base_url):
            raise ValueError(f"Invalid base URL: {base_url}")

        self.timeout = timeout
        self.headers = headers or DEFAULT_HEADERS
        self.session = requests.Session()
        self.session.headers.update(self.headers)

    def _get_page_content(
        self, url: str, timeout: Optional[int] = None
    ) -> Optional[BeautifulSoup]:
        if not is_valid_url(url):
            logger.error("Invalid URL: %s", url)
            return None

        request_timeout = timeout if timeout is not None else self.timeout

        try:
            logger.info("Fetching: %s", url)
            response = self.session.get(url, timeout=request_timeout)
            response.raise_for_status()
            return BeautifulSoup(response.text, "html.parser")

        except requests.exceptions.RequestException as e:
            logger.error("Request error while fetching %s: %s", url, e)

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

    def run(self):
        soup = self._get_page_content(self.base_url)
        links = []
        if soup:
            links = self._extract_links(soup)

        return links
