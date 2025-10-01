from urllib.parse import urljoin, urlparse

from crawler.utils.normalized_url import NormalizedURL


class URLBuilder:
    def __init__(self, base_url: NormalizedURL, same_domain_only: bool = True):
        self.base_url = base_url
        self.same_domain_only = same_domain_only
        self._base_domain = urlparse(base_url.url).netloc.lower()

    def build(self, href: str) -> NormalizedURL | None:
        if not href:
            return None

        absolute = urljoin(self.base_url.url, href)
        candidate = NormalizedURL(absolute)

        if self.same_domain_only:
            domain = urlparse(candidate.url).netloc.lower()
            if domain != self._base_domain:
                return None

        return candidate
