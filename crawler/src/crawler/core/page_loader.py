from typing import Optional
from playwright.async_api import async_playwright, Browser, Page, Playwright


class PageLoader:
    def __init__(self, headless: bool = True):
        self.headless: bool = headless
        self.playwright: Optional[Playwright] = None
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None

    async def start(self) -> None:
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(headless=self.headless)
        self.page = await self.browser.new_page()

    async def load(self, url: str) -> Page:
        if not self.page:
            raise RuntimeError("PageLoader not started. Call start() first.")
        await self.page.goto(url)
        return self.page

    async def close(self) -> None:
        if self.browser:
            await self.browser.close()
            self.browser = None
            self.page = None
        if self.playwright:
            await self.playwright.stop()
            self.playwright = None
