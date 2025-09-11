import argparse

from crawler import Crawler


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Simple web page scraper")
    parser.add_argument("url", help="The starting URL to scrape")
    return parser.parse_args()


def main():
    args = parse_arguments()

    crawler = Crawler(args.url)
    links = crawler.run()
    print(links)


if __name__ == "__main__":
    main()
