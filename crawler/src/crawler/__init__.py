import logging

from .core import StateManager, PageLoader, ElementDetector


def configure_logging(
    level: int = logging.INFO,
    fmt: str = "%(asctime)s %(levelname)s [%(name)s] %(message)s",
    datefmt: str | None = None,
) -> None:
    """Configure logging for the crawler package.

    Attaches a StreamHandler to the package logger `crawler` so that all child
    loggers (e.g., `crawler.engine.crawl_engine`) emit logs without requiring
    the application to configure global logging.

    The handler is added only once to avoid duplicates on repeated calls.
    """
    package_logger = logging.getLogger("crawler")

    if not package_logger.handlers:
        handler = logging.StreamHandler()
        handler.setLevel(level)
        handler.setFormatter(logging.Formatter(fmt=fmt, datefmt=datefmt))
        package_logger.addHandler(handler)

    package_logger.setLevel(level)
    # Prevent logs from being propagated to root unless the app wants that
    package_logger.propagate = False


__all__ = [
    "configure_logging",
]
