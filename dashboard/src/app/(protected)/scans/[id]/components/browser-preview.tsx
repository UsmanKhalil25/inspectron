"use client";

import { RefreshCw, ExternalLink, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BrowserPreviewProps {
  url: string;
  isScanning?: boolean;
}

export function BrowserPreview({
  url,
  isScanning = true,
}: BrowserPreviewProps) {
  return (
    <div className="flex flex-1 flex-col border-r overflow-hidden">
      <div className="flex h-10 shrink-0 items-center justify-between border-b bg-muted/30 px-4">
        <span className="text-xs font-medium text-muted-foreground">
          Browser Preview
        </span>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>

      <div className="relative flex flex-1 flex-col">
        <div className="flex h-8 shrink-0 items-center gap-2 border-b bg-muted/20 px-3">
          <div className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-red-400/60" />
            <span className="h-2 w-2 rounded-full bg-yellow-400/60" />
            <span className="h-2 w-2 rounded-full bg-emerald-400/60" />
          </div>
          <div className="flex flex-1 items-center gap-1.5 rounded-sm bg-muted/40 px-2 py-0.5">
            <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
            <span className="font-mono text-[10px] text-muted-foreground truncate">
              {url}
            </span>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Globe className="mx-auto mb-3 h-10 w-10 opacity-20" />
            <p className="text-sm">Browser preview will appear here</p>
            <p className="mt-1 text-xs opacity-60">
              Screenshots from the agent will be displayed
            </p>
          </div>
        </div>

        {isScanning && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full border bg-background/80 px-2.5 py-1 backdrop-blur-sm">
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
            <span className="text-[10px] font-medium text-muted-foreground">
              Agent scanning
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
