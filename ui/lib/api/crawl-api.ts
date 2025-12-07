import type {
  StartCrawlRequest,
  StartCrawlResponse,
  StopCrawlResponse,
} from "shared";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export async function startCrawl(
  request: StartCrawlRequest,
): Promise<StartCrawlResponse> {
  const response = await fetch(`${API_BASE_URL}/crawl`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to start crawl: ${response.statusText}`);
  }

  return response.json();
}

export async function stopCrawl(): Promise<StopCrawlResponse> {
  const response = await fetch(`${API_BASE_URL}/crawl`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to stop crawl: ${response.statusText}`);
  }

  return response.json();
}
