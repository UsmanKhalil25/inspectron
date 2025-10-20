import logging
import time

from playwright.async_api import Page
from dotenv import load_dotenv

from crawler.core import (
    StateManager,
    PageLoader,
    ElementDetector,
    ElementLabeler,
    OllamaClient,
)
from crawler.utils import NormalizedURL, URLBuilder
from crawler.schemas import InteractableElement


class CrawlEngine:
    def __init__(self, headless: bool = False):
        load_dotenv()

        self.logger = logging.getLogger(__name__)
        self.state_manager = StateManager()
        self.element_detector = ElementDetector()
        self.element_labeler = ElementLabeler()
        self.page_loader = PageLoader(headless=headless)
        self.ollama_client = OllamaClient()

        self._start_time: float | None = None
        self._end_time: float | None = None
        self._url_count: int = 0

    async def start(self) -> None:
        self.logger.info("Starting crawl engine")
        self._start_time = time.perf_counter()
        await self.page_loader.start()

    async def crawl(self, url: str) -> None:
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

            for link in links:
                info = await self.element_labeler.label(page, link)
                if info is None:
                    continue

                tag = await link.evaluate("(el) => el.tagName.toLowerCase()")
                text_content = await link.text_content()
                href = await link.get_attribute("href")

                if tag is None or text_content is None:
                    continue

                item = InteractableElement(
                    element_id=f"link-{self._url_count}-{info['label_number']}",
                    element=link,
                    tag_name=tag,
                    label_number=info["label_number"],
                    url=next_url.url,
                    text_content=text_content,
                )

                self.state_manager.add_interactable_element(item)

            await self._extract_and_enqueue_links(next_url, links)

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
