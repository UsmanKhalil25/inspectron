import asyncio
from fastapi import APIRouter, HTTPException, BackgroundTasks
from sse_starlette.sse import EventSourceResponse

from api.models import CrawlRequest, CrawlResponse, CrawlStatusResponse, JobStatus
from api.services import job_manager
from api.utils.log_streamer import log_streamer

router = APIRouter(prefix="/api/crawl", tags=["crawler"])


@router.post("", response_model=CrawlResponse)
async def start_crawl(request: CrawlRequest, background_tasks: BackgroundTasks):
    """Start a new crawl job."""
    # Check if another job is running
    if await job_manager.is_busy():
        raise HTTPException(
            status_code=409, detail="Another job is currently running. Please wait."
        )

    # Create new job
    job_id = job_manager.create_job("crawl")

    # Start crawl in background
    background_tasks.add_task(job_manager.start_crawl, job_id, request.url)

    return CrawlResponse(job_id=job_id, status=JobStatus.PENDING)


@router.get("/{job_id}", response_model=CrawlStatusResponse)
async def get_crawl_status(job_id: str):
    """Get the status of a crawl job."""
    job = job_manager.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return CrawlStatusResponse(
        job_id=job.job_id, status=job.status, urls=job.urls, error=job.error
    )


@router.get("/{job_id}/logs")
async def stream_crawl_logs(job_id: str):
    """Stream real-time logs for a crawl job via SSE."""
    job = job_manager.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return EventSourceResponse(log_streamer.stream_logs(job_id))

