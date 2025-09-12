import logging
import json
from typing import Optional, Iterable, Generator, List
from pathlib import Path

from bs4 import BeautifulSoup, Tag
from playwright.sync_api import sync_playwright

from common.utils.page_fetcher import PageFetcher
from common.constants import DEFAULT_TIMEOUT_MS, DEFAULT_HEADERS

from .models.scraped_url import ScrapedUrl


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

    def _scrape_with_playwright(
        self, urls: Iterable[str]
    ) -> Generator[ScrapedUrl, None, None]:
        fetcher = PageFetcher(self.timeout_ms, self.headers)

        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            context = browser.new_context(extra_http_headers=self.headers)
            page = context.new_page()
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
                    yield scraped

            finally:
                page.close()
                context.close()
                browser.close()

    def _write_batch_to_file(self, batch: List[dict], file_handle) -> None:
        for row in batch:
            file_handle.write(json.dumps(row, ensure_ascii=False) + "\n")

    def _save_to_jsonl_streaming(
        self,
        scraped_items: Generator[ScrapedUrl, None, None],
        output_file: str,
        batch_size: int = 10,
    ) -> int:
        count = 0
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with output_path.open("w", encoding="utf-8") as f:
            batch = []
            for scraped_item in scraped_items:
                batch.append(scraped_item.dict())
                count += 1
                if len(batch) >= batch_size:
                    self._write_batch_to_file(batch, f)
                    batch.clear()
            if batch:
                self._write_batch_to_file(batch, f)
        return count

    def run(
        self,
        urls: Iterable[str],
        output_file: str = "output/scraped.jsonl",
        batch_size: int = 10,
    ) -> int:
        scraped_items = self._scrape_with_playwright(urls)
        count = self._save_to_jsonl_streaming(scraped_items, output_file, batch_size)

        logger.info(
            "Scraping completed. Items scraped: %d. Saved to: %s", count, output_file
        )
        return count
