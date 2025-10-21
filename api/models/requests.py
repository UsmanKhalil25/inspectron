from pydantic import BaseModel, HttpUrl


class CrawlRequest(BaseModel):
    url: str


class ScanRequest(BaseModel):
    job_id: str

