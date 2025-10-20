from langchain_core.tools import tool
from playwright.async_api import Page, ElementHandle

SCROLL_PIXELS = 500


class BrowserToolKit:
    def __init__(self, page: Page):
        self.page = page

    @tool("click_element")
    async def click_element(self, element: ElementHandle):
        await element.click()
        return "Element clicked successfully."

    @tool("scroll_up")
    async def scroll_up(self):
        await self.page.evaluate(f"window.scrollBy(0, -{SCROLL_PIXELS})")
        return f"Scrolled up by {SCROLL_PIXELS}px."

    @tool("scroll_down")
    async def scroll_down(self):
        await self.page.evaluate(f"window.scrollBy(0, {SCROLL_PIXELS})")
        return f"Scrolled down by {SCROLL_PIXELS}px."

    def get_tools(self):
        return [
            self.click_element,
            self.scroll_up,
            self.scroll_down,
        ]
