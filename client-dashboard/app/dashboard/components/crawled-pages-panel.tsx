"use client"

import { FileText, Loader2, CheckCircle2, AlertCircle, Clock, ChevronRight } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { CrawledPage } from "../types"

interface CrawledPagesPanelProps {
  pages: CrawledPage[]
  onPageSelect: (page: CrawledPage) => void
  selectedUrl: string | null
}

export function CrawledPagesPanel({ pages, onPageSelect, selectedUrl }: CrawledPagesPanelProps) {
  const getStatusIcon = (status: CrawledPage["status"]) => {
    switch (status) {
      case "crawling":
        return <Loader2 className="size-4 animate-spin text-primary" />
      case "crawled":
        return <CheckCircle2 className="size-4 text-success" />
      case "error":
        return <AlertCircle className="size-4 text-destructive" />
      default:
        return <Clock className="size-4 text-muted-foreground" />
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Discovered Pages</h2>
      </div>

      <ScrollArea className="flex-1">
        {pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <FileText className="size-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No pages discovered yet</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => onPageSelect(page)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                  "hover:bg-secondary/80",
                  selectedUrl === page.url && "bg-secondary",
                )}
              >
                {getStatusIcon(page.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{page.title}</p>
                  <p className="text-xs text-muted-foreground truncate font-mono">{page.url}</p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
