"use client"

import { Link2, Play, Square, RotateCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { CrawlStatus } from "../types"

interface UrlInputPanelProps {
  url: string
  setUrl: (url: string) => void
  crawlStatus: CrawlStatus
  onStartCrawl: () => void
  onStopCrawl: () => void
}

export function UrlInputPanel({ url, setUrl, crawlStatus, onStartCrawl, onStopCrawl }: UrlInputPanelProps) {
  const isCrawling = crawlStatus === "crawling"

  return (
    <div className="border-b border-border p-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="url-input" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Target URL
        </Label>
        <div className="relative">
          <Link2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="url-input"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isCrawling}
            className="pl-10 bg-secondary/50 border-border focus:bg-secondary"
          />
        </div>
      </div>

      <div className="flex gap-2">
        {isCrawling ? (
          <Button onClick={onStopCrawl} variant="destructive" className="flex-1">
            <Square className="mr-2 size-4" />
            Stop Crawl
          </Button>
        ) : (
          <Button
            onClick={onStartCrawl}
            disabled={!url.trim()}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {crawlStatus === "completed" || crawlStatus === "stopped" ? (
              <>
                <RotateCcw className="mr-2 size-4" />
                Restart
              </>
            ) : (
              <>
                <Play className="mr-2 size-4" />
                Start Crawl
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
