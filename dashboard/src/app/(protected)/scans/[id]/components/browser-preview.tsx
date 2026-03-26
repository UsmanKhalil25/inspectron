"use client";

import { useSubscription } from "@apollo/client";
import Image from "next/image";
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Loader2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BROWSER_PREVIEW_STREAM } from "@/graphql/subscriptions/browser-preview-stream";
import type { GetScanQuery } from "@/__generated__/graphql";

interface BrowserPreviewProps {
  scan: GetScanQuery["scan"];
}

export function BrowserPreview({ scan }: BrowserPreviewProps) {
  const isScanning = scan.status === "ACTIVE" || scan.status === "QUEUED";
  const runId = scan.runId;
  const [currentUrl, setCurrentUrl] = useState(scan.url ?? "");

  const { data, loading, error } = useSubscription(BROWSER_PREVIEW_STREAM, {
    variables: { runId: runId || "" },
    skip: !runId || !isScanning,
    shouldResubscribe: true,
  });

  useEffect(() => {
    if (data?.browserPreviewStream?.url) {
      setCurrentUrl(data.browserPreviewStream.url);
    }
  }, [data?.browserPreviewStream?.url]);

  const connectionStatus = loading
    ? "connecting"
    : data?.browserPreviewStream
      ? "connected"
      : runId && isScanning
        ? "connecting"
        : "disconnected";

  const currentFrame = data?.browserPreviewStream?.frame ?? null;

  const renderContent = () => {
    if (connectionStatus === "connecting" && !currentFrame) {
      return (
        <div className="text-center text-muted-foreground">
          <Loader2 className="mx-auto mb-3 h-10 w-10 animate-spin opacity-50" />
          <p className="text-sm">Connecting to stream...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-muted-foreground">
          <Globe className="mx-auto mb-3 h-10 w-10 opacity-20" />
          <p className="text-sm text-red-400">Failed to load preview</p>
          <p className="text-xs text-red-400/60 mt-1">{error.message}</p>
        </div>
      );
    }

    if (currentFrame) {
      return (
        <Image
          src={`data:image/jpeg;base64,${currentFrame}`}
          alt="Browser preview"
          fill
          className="object-contain transition-opacity duration-100"
          unoptimized
          priority
          sizes="100vw"
        />
      );
    }

    return (
      <div className="text-center text-muted-foreground">
        <Globe className="mx-auto mb-3 h-10 w-10 opacity-20" />
        <p className="text-sm">Browser preview will appear here</p>
        <p className="mt-1 text-xs opacity-60">Live streaming from the agent</p>
      </div>
    );
  };

  return (
    <div className="flex flex-1 flex-col border-r overflow-hidden bg-black">
      <div className="flex h-10 shrink-0 items-center justify-between border-b bg-muted/30 px-4">
        <span className="text-xs font-medium text-muted-foreground">
          Browser Preview
        </span>

        <div className="flex items-center gap-2">
          {runId && (
            <div className="flex items-center gap-1.5 rounded-sm bg-muted/40 px-2 py-0.5">
              <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground truncate">
                Run: {runId}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1">
            {connectionStatus === "connected" && (
              <Wifi className="h-4 w-4 text-emerald-400" />
            )}
            {connectionStatus === "connecting" && (
              <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
            )}
            {connectionStatus === "disconnected" && (
              <WifiOff className="h-4 w-4 text-muted-foreground/50" />
            )}
          </div>
        </div>
      </div>

      {/* URL bar */}
      <div className="flex h-9 shrink-0 items-center gap-2 border-b bg-muted/20 px-3">
        <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground/40" />
        <div className="flex flex-1 items-center gap-1.5 rounded-md bg-muted/40 px-2.5 py-1">
          <Globe className="h-3 w-3 shrink-0 text-muted-foreground/50" />
          <span className="flex-1 truncate text-xs text-muted-foreground">
            {currentUrl || "about:blank"}
          </span>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center overflow-hidden">
          {renderContent()}
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
