import asyncio
import uuid
from typing import Optional, List

from crawler.engine import CrawlEngine
from vulnerability_scanner.engine import ScanEngine
from vulnerability_scanner.schemas import Vulnerability

from api.models.responses import JobStatus, VulnerabilityResponse
from api.utils.log_streamer import log_streamer


class JobData:
    def __init__(self, job_id: str, job_type: str):
        self.job_id = job_id
        self.job_type = job_type  # "crawl" or "scan"
        self.status = JobStatus.PENDING
        self.urls: List[str] = []
        self.vulnerabilities: List[VulnerabilityResponse] = []
        self.error: Optional[str] = None


class JobManager:
    """Manages crawl and scan jobs in memory."""

    def __init__(self):
        self.jobs: dict[str, JobData] = {}
        self.current_job_id: Optional[str] = None
        self._lock = asyncio.Lock()

    def create_job(self, job_type: str) -> str:
        """Create a new job and return its ID."""
        job_id = str(uuid.uuid4())
        self.jobs[job_id] = JobData(job_id, job_type)
        return job_id

    def get_job(self, job_id: str) -> Optional[JobData]:
        """Get job data by ID."""
        return self.jobs.get(job_id)

    async def is_busy(self) -> bool:
        """Check if there's currently a running job."""
        async with self._lock:
            return self.current_job_id is not None

    async def start_crawl(self, job_id: str, url: str) -> None:
        """Start a crawl job."""
        async with self._lock:
            if self.current_job_id is not None:
                job = self.get_job(job_id)
                if job:
                    job.status = JobStatus.FAILED
                    job.error = "Another job is currently running"
                return

            self.current_job_id = job_id

        job = self.get_job(job_id)
        if not job:
            return

        # Create logger for this job
        logger = log_streamer.create_job_logger(job_id)

        try:
            job.status = JobStatus.RUNNING
            logger.info(f"Starting crawl for {url}")

            # Initialize crawl engine
            crawl_engine = CrawlEngine(headless=True)
            await crawl_engine.start()

            try:
                # Run the crawl
                urls = await crawl_engine.crawl(url)
                job.urls = urls
                job.status = JobStatus.COMPLETED
                logger.info(f"Crawl completed. Found {len(urls)} URLs.")

            finally:
                await crawl_engine.close()

        except Exception as e:
            logger.error(f"Crawl failed: {str(e)}")
            job.status = JobStatus.FAILED
            job.error = str(e)

        finally:
            async with self._lock:
                self.current_job_id = None

    async def start_scan(self, job_id: str, crawl_job_id: str) -> None:
        """Start a vulnerability scan job."""
        async with self._lock:
            if self.current_job_id is not None:
                job = self.get_job(job_id)
                if job:
                    job.status = JobStatus.FAILED
                    job.error = "Another job is currently running"
                return

            self.current_job_id = job_id

        job = self.get_job(job_id)
        if not job:
            return

        # Get URLs from crawl job
        crawl_job = self.get_job(crawl_job_id)
        if not crawl_job or not crawl_job.urls:
            job.status = JobStatus.FAILED
            job.error = "Crawl job not found or has no URLs"
            async with self._lock:
                self.current_job_id = None
            return

        # Create logger for this job
        logger = log_streamer.create_job_logger(job_id)

        try:
            job.status = JobStatus.RUNNING
            logger.info(f"Starting vulnerability scan on {len(crawl_job.urls)} URLs")

            # Initialize scan engine
            scan_engine = ScanEngine(headless=True)
            await scan_engine.start()

            try:
                # Run the scan
                vulnerabilities: List[Vulnerability] = await scan_engine.scan(
                    crawl_job.urls
                )

                # Convert to response format
                job.vulnerabilities = [
                    VulnerabilityResponse(
                        url=v.url,
                        title=v.title,
                        description=v.description,
                        severity=v.severity.value,
                        recommendation=v.recommendation,
                    )
                    for v in vulnerabilities
                ]

                job.status = JobStatus.COMPLETED
                logger.info(
                    f"Scan completed. Found {len(vulnerabilities)} vulnerabilities."
                )

            finally:
                await scan_engine.close()

        except Exception as e:
            logger.error(f"Scan failed: {str(e)}")
            job.status = JobStatus.FAILED
            job.error = str(e)

        finally:
            async with self._lock:
                self.current_job_id = None


# Global job manager instance
job_manager = JobManager()

