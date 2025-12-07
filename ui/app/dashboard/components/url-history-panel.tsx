"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { CrawlStats, UrlStatus } from "shared";

interface UrlHistoryPanelProps {
  urlHistory: UrlStatus[];
  stats: CrawlStats | null;
  onUrlSelect?: (url: string) => void;
}

export function UrlHistoryPanel({
  urlHistory,
  stats,
  onUrlSelect,
}: UrlHistoryPanelProps) {
  return (
    <div className="space-y-4 border rounded-lg p-4 bg-card">
      <div>
        <h3 className="text-lg font-semibold mb-3">Crawl Progress</h3>

        {stats && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-secondary/50 p-2 rounded">
              <div className="text-xs text-muted-foreground">Discovered</div>
              <div className="text-lg font-semibold">
                {stats.totalDiscovered}
              </div>
            </div>
            <div className="bg-secondary/50 p-2 rounded">
              <div className="text-xs text-muted-foreground">Visited</div>
              <div className="text-lg font-semibold">{stats.visitedCount}</div>
            </div>
            <div className="bg-secondary/50 p-2 rounded">
              <div className="text-xs text-muted-foreground">Queue</div>
              <div className="text-lg font-semibold">{stats.queueDepth}</div>
            </div>
            <div className="bg-secondary/50 p-2 rounded">
              <div className="text-xs text-muted-foreground">Failed</div>
              <div className="text-lg font-semibold text-destructive">
                {stats.failedCount}
              </div>
            </div>
          </div>
        )}

        {stats && stats.crawlRate > 0 && (
          <div className="text-xs text-muted-foreground mb-3">
            Rate: {stats.crawlRate.toFixed(2)} pages/sec
          </div>
        )}
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Discovered URLs</h4>
        <ScrollArea className="h-[500px]">
          {urlHistory.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              No URLs discovered yet
            </div>
          ) : (
            <div className="space-y-2 pr-4">
              {urlHistory.map((item, index) => (
                <div
                  key={`${item.url}-${index}`}
                  className={cn(
                    "p-2 rounded border cursor-pointer transition-colors hover:bg-accent",
                    item.status === "visited" &&
                      "border-green-500/50 bg-green-500/10",
                    item.status === "visiting" &&
                      "border-blue-500/50 bg-blue-500/10 animate-pulse",
                    item.status === "failed" &&
                      "border-red-500/50 bg-red-500/10",
                    item.status === "queued" &&
                      "border-yellow-500/50 bg-yellow-500/10",
                    item.status === "discovered" &&
                      "border-muted bg-secondary/20",
                  )}
                  onClick={() => onUrlSelect?.(item.url)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 truncate text-sm" title={item.url}>
                      {item.url}
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "ml-2 text-xs shrink-0",
                        item.status === "visited" &&
                          "border-green-500 text-green-500",
                        item.status === "visiting" &&
                          "border-blue-500 text-blue-500",
                        item.status === "failed" &&
                          "border-red-500 text-red-500",
                        item.status === "queued" &&
                          "border-yellow-500 text-yellow-500",
                      )}
                    >
                      {item.status}
                    </Badge>
                  </div>
                  {item.error && (
                    <div
                      className="text-xs text-red-500 mt-1 truncate"
                      title={item.error}
                    >
                      Error: {item.error}
                    </div>
                  )}
                  {item.statusCode && (
                    <div className="text-xs text-muted-foreground mt-1">
                      HTTP {item.statusCode}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
