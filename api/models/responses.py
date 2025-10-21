from enum import Enum
from typing import List, Optional
from pydantic import BaseModel


class JobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class CrawlResponse(BaseModel):
    job_id: str
    status: JobStatus


class CrawlStatusResponse(BaseModel):
    job_id: str
    status: JobStatus
    urls: List[str] = []
    error: Optional[str] = None


class VulnerabilityResponse(BaseModel):
    url: str
    title: str
    description: str
    severity: str
    recommendation: Optional[str] = None


class ScanResponse(BaseModel):
    job_id: str
    status: JobStatus


class ScanStatusResponse(BaseModel):
    job_id: str
    status: JobStatus
    vulnerabilities: List[VulnerabilityResponse] = []
    error: Optional[str] = None

