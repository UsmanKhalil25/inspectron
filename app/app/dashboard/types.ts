export type CrawlStatus = "idle" | "crawling" | "completed" | "stopped" | "error"

export type PageStatus = "pending" | "crawling" | "crawled" | "error"

export interface CrawledPage {
  id: string
  url: string
  title: string
  status: PageStatus
  depth: number
  timestamp: Date
  error?: string
}

export interface AiMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  requiresInput?: boolean
}
