from collections import deque
from typing import Set, Optional

from crawler.utils import NormalizedURL


class StateManager:
    def __init__(self):
        self.visited_urls: Set[NormalizedURL] = set()
        self.url_queue: deque[NormalizedURL] = deque()

    def can_enqueue(self, url: NormalizedURL) -> bool:
        return url not in self.visited_urls and url not in self.url_queue

    def add_url(self, url: NormalizedURL) -> None:
        if self.can_enqueue(url):
            self.url_queue.append(url)

    def get_next_url(self) -> Optional[NormalizedURL]:
        if not self.url_queue:
            return None
        next_url = self.url_queue.popleft()
        return next_url

    def mark_visited(self, url: NormalizedURL) -> None:
        self.visited_urls.add(url)

    def has_unvisited_urls(self) -> bool:
        return bool(self.url_queue)
