"use client";

import { ExternalLink, Loader2, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CrawlStatus } from "../types";

interface LivePreviewPanelProps {
  currentFrame: string | null;
  currentUrl: string | null;
  crawlStatus: CrawlStatus;
  error: string | null;
  isConnected: boolean;
}

export function LivePreviewPanel({
  currentFrame,
  currentUrl,
  crawlStatus,
  error,
  isConnected,
}: LivePreviewPanelProps) {
  const isCrawling = crawlStatus === "crawling";
  const displayUrl = currentUrl || "No URL";

  if (!currentUrl && !isCrawling) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-secondary mb-4">
          <Monitor className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Preview Available</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Enter a URL and start crawling to see a live preview of the pages
          being analyzed.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isCrawling && (
            <Loader2 className="size-4 animate-spin text-primary shrink-0" />
          )}
          <span className="text-sm text-muted-foreground truncate font-mono">
            {displayUrl}
          </span>
          {isCrawling && currentUrl && (
            <span className="text-xs text-blue-600 dark:text-blue-500">
              • Crawling
            </span>
          )}
          {!isConnected && isCrawling && (
            <span className="text-xs text-yellow-600 dark:text-yellow-500">
              • Connecting...
            </span>
          )}
          {error && (
            <span className="text-xs text-red-600 dark:text-red-500">
              • Error
            </span>
          )}
        </div>
        {currentUrl && (
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={() => window.open(currentUrl, "_blank")}
          >
            <ExternalLink className="size-4" />
            <span className="sr-only">Open in new tab</span>
          </Button>
        )}
      </div>

      <div className="flex-1 bg-secondary/30 relative overflow-hidden">
        {isCrawling && !currentFrame && !error && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="size-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              </div>
              <span className="text-sm text-muted-foreground">
                Starting screencast...
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
            <div className="max-w-md">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 mb-4 mx-auto">
                <Monitor className="size-8 text-destructive" />
              </div>
              <h3 className="text-lg font-medium mb-2">Crawl Error</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        {currentFrame && !error ? (
          <img
            src={`data:image/jpeg;base64,${currentFrame}`}
            alt="Live browser screencast"
            className="size-full object-contain"
          />
        ) : (
          !error && (
            <div className="flex h-full items-center justify-center">
              <span className="text-sm text-muted-foreground">
                Waiting for screencast...
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
