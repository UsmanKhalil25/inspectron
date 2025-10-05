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


    async def get_standalone_buttons(self, page: Page) -> List[ElementHandle]:
        buttons = await self.find_buttons(page)
        filtered = []
        for button in buttons:
            is_child_of_link = await page.evaluate(
                """(btn) => {
                    let el = btn.parentElement;
                    while (el) {
                        if (el.tagName.toLowerCase() === 'a') return true;
                        el = el.parentElement;
                    }
                    return false;
                }""",
                button
            )
            if not is_child_of_link:
                filtered.append(button)
        return filtered

