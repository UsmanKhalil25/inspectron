"use client"

import { ExternalLink, Loader2, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CrawlStatus } from "../types"

interface LivePreviewPanelProps {
  url: string | null
  crawlStatus: CrawlStatus
}

export function LivePreviewPanel({ url, crawlStatus }: LivePreviewPanelProps) {
  const isCrawling = crawlStatus === "crawling"

  if (!url) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-secondary mb-4">
          <Monitor className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Preview Available</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Enter a URL and start crawling to see a live preview of the pages being analyzed.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Preview Header */}
      <div className="flex h-12 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isCrawling && <Loader2 className="size-4 animate-spin text-primary shrink-0" />}
          <span className="text-sm text-muted-foreground truncate font-mono">{url}</span>
        </div>
        <Button variant="ghost" size="sm" className="shrink-0" onClick={() => window.open(url, "_blank")}>
          <ExternalLink className="size-4" />
          <span className="sr-only">Open in new tab</span>
        </Button>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 bg-secondary/30 relative">
        {isCrawling && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="size-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              </div>
              <span className="text-sm text-muted-foreground">Analyzing page...</span>
            </div>
          </div>
        )}
        <iframe
          src={url}
          title="Live Preview"
          className="size-full border-0"
          sandbox="allow-same-origin allow-scripts"
        />
      </div>
    </div>
  )
}
