import argparse
from typing import Optional
from urllib.parse import urlparse, ParseResult

import requests
from bs4 import BeautifulSoup


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Simple web page scraper")
    parser.add_argument("url", help="The starting URL to scrape")
    return parser.parse_args()


def normalize_url(url: str) -> ParseResult:
    parsed = urlparse(url)
    if not parsed.scheme:
        url = f"http://{url}"
        parsed = urlparse(url)
    return parsed


def fetch_page(url: str, timeout: int = 10) -> Optional[BeautifulSoup]:
    try:
        response = requests.get(url, timeout=timeout)
        response.raise_for_status()
        return BeautifulSoup(response.text, "html.parser")
    except requests.RequestException:
        return None


def main() -> None:
    args = parse_arguments()
    parsed_url = normalize_url(args.url)
    soup = fetch_page(parsed_url.geturl())

    if soup:
        print(soup.prettify())
    else:
        print(f"Failed to fetch: {parsed_url.geturl()}")


if __name__ == "__main__":
    main()
