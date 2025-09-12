import argparse
import logging
import os

from crawler import Crawler
from scraper import Scraper


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Simple web page scraper")
    parser.add_argument("url", help="The starting URL to scrape")
    parser.add_argument(
        "--max-pages",
        type=int,
        default=None,
        help="Maximum number of pages to crawl (overrides default)",
    )
    parser.add_argument(
        "--log-level",
        default=os.environ.get("LOG_LEVEL", "INFO"),
        choices=["CRITICAL", "ERROR", "WARNING", "INFO", "DEBUG"],
        help="Logging level (default from LOG_LEVEL env or INFO)",
    )
    return parser.parse_args()


def main():
    args = parse_arguments()

    logging.basicConfig(
        level=getattr(logging, args.log_level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )

    crawler = (
        Crawler(args.url)
        if args.max_pages is None
        else Crawler(args.url, max_pages=args.max_pages)
    )
    links = crawler.run()
    scraper = Scraper()
    results = scraper.run(links)
    print(results)


if __name__ == "__main__":
    main()
