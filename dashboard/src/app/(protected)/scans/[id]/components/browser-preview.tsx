"use client";

import { useQuery } from "@apollo/client";
import Image from "next/image";
import { RefreshCw, ExternalLink, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SCAN_SCREENSHOT } from "@/graphql/queries/scan";

interface BrowserPreviewProps {
  runId?: string | null;
  isScanning?: boolean;
}

export function BrowserPreview({
  runId,
  isScanning = true,
}: BrowserPreviewProps) {
  const { data, loading, error, refetch } = useQuery(SCAN_SCREENSHOT, {
    variables: { runId: runId || "" },
    skip: !runId || !isScanning,
    fetchPolicy: "network-only",
    pollInterval: runId && isScanning ? 2000 : 0,
  });

  const screenshot = data?.scanScreenshot;

  return (
    <div className="flex flex-1 flex-col border-r overflow-hidden">
      <div className="flex h-10 shrink-0 items-center justify-between border-b bg-muted/30 px-4">
        <span className="text-xs font-medium text-muted-foreground">
          Browser Preview
        </span>
        {runId && (
          <div className="flex w-1/2 items-center gap-1.5 rounded-sm bg-muted/40 px-2 py-0.5">
            <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground truncate">
              Run: {runId.slice(0, 8)}...
            </span>
          </div>
        )}

        <Button variant="ghost" size="icon" onClick={() => runId && refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative flex flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center overflow-hidden">
          {screenshot ? (
            <Image
              src={`data:image/png;base64,${screenshot}`}
              alt="Browser screenshot"
              fill
              className="object-contain"
              unoptimized
            />
          ) : loading ? (
            <div className="text-center text-muted-foreground">
              <Loader2 className="mx-auto mb-3 h-10 w-10 animate-spin opacity-50" />
              <p className="text-sm">Loading screenshot...</p>
            </div>
          ) : error ? (
            <div className="text-center text-muted-foreground">
              <Globe className="mx-auto mb-3 h-10 w-10 opacity-20" />
              <p className="text-sm text-red-400">Failed to load screenshot</p>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <Globe className="mx-auto mb-3 h-10 w-10 opacity-20" />
              <p className="text-sm">Browser preview will appear here</p>
              <p className="mt-1 text-xs opacity-60">
                Screenshots from the agent will be displayed
              </p>
            </div>
          )}
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
