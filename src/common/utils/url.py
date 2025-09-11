from urllib.parse import urlparse, urljoin


def normalize_url(url: str, default_scheme: str = "https") -> str:
    if not url or not url.strip():
        raise ValueError("URL cannot be empty")

    url = url.strip()
    parsed = urlparse(url)

    if parsed.scheme:
        return url

    return f"{default_scheme}://{url}"


def is_valid_url(url: str) -> bool:
    parsed = urlparse(url)
    return bool(parsed.netloc and parsed.scheme in ("http", "https"))


def make_absolute_url(base_url: str, relative_url: str) -> str:
    base_url = normalize_url(base_url)
    return urljoin(base_url, relative_url)
