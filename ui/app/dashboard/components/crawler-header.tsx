"use client"

import { Globe, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { CrawlStatus } from "../types"

interface CrawlerHeaderProps {
  crawlStatus: CrawlStatus
  pagesCount: number
}

export function CrawlerHeader({ crawlStatus, pagesCount }: CrawlerHeaderProps) {
  const getStatusBadge = () => {
    switch (crawlStatus) {
      case "crawling":
        return (
          <Badge className="bg-primary/20 text-primary border-primary/30 animate-pulse">
            <span className="mr-1.5 size-2 rounded-full bg-primary animate-pulse" />
            Crawling
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-success/20 text-success border-success/30">
            <span className="mr-1.5 size-2 rounded-full bg-success" />
            Completed
          </Badge>
        )
      case "stopped":
        return (
          <Badge className="bg-warning/20 text-warning border-warning/30">
            <span className="mr-1.5 size-2 rounded-full bg-warning" />
            Stopped
          </Badge>
        )
      case "error":
        return (
          <Badge className="bg-destructive/20 text-destructive border-destructive/30">
            <span className="mr-1.5 size-2 rounded-full bg-destructive" />
            Error
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <span className="mr-1.5 size-2 rounded-full bg-muted-foreground" />
            Idle
          </Badge>
        )
    }
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Globe className="size-4 text-primary" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Inspectron</span>
          <Badge variant="outline" className="text-xs font-normal">
            <Zap className="mr-1 size-3" />
            AI Powered
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {pagesCount > 0 && (
          <span className="text-sm text-muted-foreground">
            {pagesCount} page{pagesCount !== 1 ? "s" : ""} discovered
          </span>
        )}
        {getStatusBadge()}
      </div>
    </header>
  )
}
