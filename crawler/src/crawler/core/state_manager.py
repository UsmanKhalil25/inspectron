from collections import deque
from typing import Set, Optional


class StateManager:
    def __init__(self):
        self.visited_urls: Set[str] = set()
        self.url_queue: deque[str] = deque()

    def add_url(self, url: str) -> None:
        if url not in self.visited_urls and url not in self.url_queue:
            self.url_queue.append(url)

    def get_next_url(self) -> Optional[str]:
        return self.url_queue.popleft() if self.url_queue else None

    def mark_visited(self, url: str) -> None:
        self.visited_urls.add(url)

    def has_unvisited_urls(self) -> bool:
        return bool(self.url_queue)
