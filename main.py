import argparse
import logging
import asyncio

import crawler
from crawler.engine import CrawlEngine

def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("url", help="The starting URL to scrape")
    return parser.parse_args()


async def run(url: str) -> None:
    engine = CrawlEngine()
    await engine.start()
    try:
        await engine.crawl(url)
    finally:
        await engine.close()


def main():
    crawler.configure_logging(level=logging.DEBUG)
    args = parse_arguments()
    asyncio.run(run(args.url))

if __name__ == "__main__":
    main()
