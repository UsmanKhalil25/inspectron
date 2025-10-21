const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface CrawlResponse {
  job_id: string;
  status: string;
}

export interface CrawlStatusResponse {
  job_id: string;
  status: string;
  urls: string[];
  error?: string;
}

export interface VulnerabilityResponse {
  url: string;
  title: string;
  description: string;
  severity: string;
  recommendation?: string;
}

export interface ScanResponse {
  job_id: string;
  status: string;
}

export interface ScanStatusResponse {
  job_id: string;
  status: string;
  vulnerabilities: VulnerabilityResponse[];
  error?: string;
}

export async function startCrawl(url: string): Promise<CrawlResponse> {
  const response = await fetch(`${API_BASE_URL}/api/crawl`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to start crawl");
  }

  return response.json();
}

export async function getCrawlStatus(
  jobId: string
): Promise<CrawlStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/api/crawl/${jobId}`);

  if (!response.ok) {
    throw new Error("Failed to get crawl status");
  }

  return response.json();
}

export async function startScan(crawlJobId: string): Promise<ScanResponse> {
  const response = await fetch(`${API_BASE_URL}/api/scan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ job_id: crawlJobId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to start scan");
  }

  return response.json();
}

export async function getScanStatus(jobId: string): Promise<ScanStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/api/scan/${jobId}`);

  if (!response.ok) {
    throw new Error("Failed to get scan status");
  }

  return response.json();
}

export function getCrawlLogsUrl(jobId: string): string {
  return `${API_BASE_URL}/api/crawl/${jobId}/logs`;
}

export function getScanLogsUrl(jobId: string): string {
  return `${API_BASE_URL}/api/scan/${jobId}/logs`;
}

