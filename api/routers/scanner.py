import asyncio
from fastapi import APIRouter, HTTPException, BackgroundTasks
from sse_starlette.sse import EventSourceResponse

from api.models import ScanRequest, ScanResponse, ScanStatusResponse, JobStatus
from api.services import job_manager
from api.utils.log_streamer import log_streamer

router = APIRouter(prefix="/api/scan", tags=["scanner"])


@router.post("", response_model=ScanResponse)
async def start_scan(request: ScanRequest, background_tasks: BackgroundTasks):
    """Start a new vulnerability scan job."""
    # Check if another job is running
    if await job_manager.is_busy():
        raise HTTPException(
            status_code=409, detail="Another job is currently running. Please wait."
        )

    # Verify the crawl job exists
    crawl_job = job_manager.get_job(request.job_id)
    if not crawl_job or crawl_job.job_type != "crawl":
        raise HTTPException(status_code=404, detail="Crawl job not found")

    if crawl_job.status != JobStatus.COMPLETED:
        raise HTTPException(
            status_code=400, detail="Crawl job must be completed before scanning"
        )

    # Create new scan job
    job_id = job_manager.create_job("scan")

    # Start scan in background
    background_tasks.add_task(job_manager.start_scan, job_id, request.job_id)

    return ScanResponse(job_id=job_id, status=JobStatus.PENDING)


@router.get("/{job_id}", response_model=ScanStatusResponse)
async def get_scan_status(job_id: str):
    """Get the status of a scan job."""
    job = job_manager.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return ScanStatusResponse(
        job_id=job.job_id,
        status=job.status,
        vulnerabilities=job.vulnerabilities,
        error=job.error,
    )


@router.get("/{job_id}/logs")
async def stream_scan_logs(job_id: str):
    """Stream real-time logs for a scan job via SSE."""
    job = job_manager.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return EventSourceResponse(log_streamer.stream_logs(job_id))

