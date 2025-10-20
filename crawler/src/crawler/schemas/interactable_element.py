from dataclasses import dataclass
from typing import Optional
from playwright.async_api import ElementHandle


@dataclass
class InteractableElement:
    element_id: str
    tag_name: str
    text_content: str
    element: ElementHandle
    label_number: Optional[int]
    url: str

    def __str__(self) -> str:
        return (
            f"InteractableElement("
            f"id={self.element_id!r}, "
            f"tag={self.tag_name!r}, "
            f"label_number={self.label_number}, "
            f"url={self.url!r}"
            f")"
        )
