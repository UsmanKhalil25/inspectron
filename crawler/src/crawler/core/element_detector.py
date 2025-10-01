from typing import List
from playwright.async_api import Page, ElementHandle


class ElementDetector:

    async def find_links(self, page: Page) -> List[ElementHandle]:
        return await page.query_selector_all("a")

    async def find_buttons(self, page: Page) -> List[ElementHandle]:
        return await page.query_selector_all("button")

    async def find_inputs(self, page: Page) -> List[ElementHandle]:
        return await page.query_selector_all("input")

    async def find_textareas(self, page: Page) -> List[ElementHandle]:
        return await page.query_selector_all("textarea")

    async def find_selects(self, page: Page) -> List[ElementHandle]:
        return await page.query_selector_all("select")
