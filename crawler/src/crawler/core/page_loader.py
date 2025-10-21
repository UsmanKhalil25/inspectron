import logging
from typing import Optional
from playwright.async_api import async_playwright, Browser, Page, Playwright

PAGE_LOAD_TIMEOUT_SECONDS = 40

class PageLoader:
    def __init__(self, headless: bool = True):
        self.logger = logging.getLogger(__name__)
        self.headless: bool = headless
        self.playwright: Optional[Playwright] = None
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None

    async def start(self) -> None:
        self.logger.info("Starting Playwright headless=%s", self.headless)
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(headless=self.headless)
        self.page = await self.browser.new_page()

    async def load(self, url: str) -> Page:
        if not self.page:
            raise RuntimeError("PageLoader not started. Call start() first.")

        await self.page.goto(url, timeout=PAGE_LOAD_TIMEOUT_SECONDS * 1000)
        return self.page

    async def close(self) -> None:
        self.logger.info("Closing Playwright")
        if self.browser:
            await self.browser.close()
            self.browser = None
            self.page = None
        if self.playwright:
            await self.playwright.stop()
            self.playwright = None

