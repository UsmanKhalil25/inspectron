from urllib.parse import urlparse, urlunparse


class NormalizedURL:
    def __init__(self, raw_url: str):
        self.raw_url = raw_url.strip()
        self.parsed = self._parse_and_normalize(self.raw_url)

    def _parse_and_normalize(self, url: str):
        if "://" not in url:
            url = "http://" + url

        parsed = urlparse(url)

        netloc = parsed.netloc.lower()

        path = parsed.path or "/"
        if path != "/" and path.endswith("/"):
            path = path.rstrip("/")

        return parsed._replace(netloc=netloc, path=path)

    @property
    def url(self) -> str:
        """Return the normalized URL as string."""
        return urlunparse(self.parsed)

    def __str__(self) -> str:
        return self.url

    def __eq__(self, other) -> bool:
        if not isinstance(other, NormalizedURL):
            return NotImplemented
        return self.url == other.url

    def __hash__(self) -> int:
        return hash(self.url)
