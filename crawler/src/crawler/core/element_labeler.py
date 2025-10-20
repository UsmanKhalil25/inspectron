from typing import Optional
from playwright.async_api import ElementHandle, Page

from crawler.types import LabelInfo

LABEL_COLORS = {"a": "red", "button": "blue"}


class ElementLabeler:
    def __init__(self) -> None:
        self._count: int = 0

    def start_page(self) -> None:
        self._count = 0

    async def _apply_outline(self, element: ElementHandle, color: str) -> None:
        await element.evaluate(
            """(el, color) => {
                el.style.outline = `2px solid ${color}`;
                el.style.outlineOffset = '2px';
            }""",
            color,
        )

    async def _add_number_label(
        self, page: Page, element: ElementHandle, color: str, num: int
    ) -> None:
        await page.evaluate(
            """([el, color, num]) => {
                const rect = el.getBoundingClientRect();
                const label = document.createElement('div');
                label.textContent = num;
                label.style.position = 'absolute';
                label.style.left = `${window.scrollX + rect.left - 15}px`;
                label.style.top = `${window.scrollY + rect.top - 15}px`;
                label.style.backgroundColor = color;
                label.style.color = 'white';
                label.style.borderRadius = '50%';
                label.style.width = '18px';
                label.style.height = '18px';
                label.style.display = 'flex';
                label.style.alignItems = 'center';
                label.style.justifyContent = 'center';
                label.style.fontSize = '12px';
                label.style.fontFamily = 'sans-serif';
                label.style.zIndex = 9999;
                label.style.pointerEvents = 'none';
                document.body.appendChild(label);
            }""",
            [element, color, num],
        )

    async def label(self, page: Page, element: ElementHandle) -> Optional[LabelInfo]:
        tag: str = await element.evaluate("(el) => el.tagName.toLowerCase()")
        color = LABEL_COLORS.get(tag)
        if not color:
            return None

        self._count += 1
        num = self._count
        await self._apply_outline(element, color)
        await self._add_number_label(page, element, color, num)

        return {
            "label_number": num,
            "color": color,
        }
