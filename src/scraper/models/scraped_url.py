from dataclasses import dataclass
from typing import Optional


@dataclass
class ScrapedUrl:
    url: str
    title: Optional[str] = None
    meta_description: Optional[str] = None
    html: Optional[str] = None
