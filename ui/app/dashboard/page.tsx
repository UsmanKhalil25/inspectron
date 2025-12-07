"use client";

import { useState, useCallback, useEffect } from "react";
import { CrawlerHeader } from "./components/crawler-header";
import { UrlInputPanel } from "./components/url-input-panel";
import { LivePreviewPanel } from "./components/live-preview-panel";
import { AiChatPanel } from "./components/ai-chat-panel";
import { UrlHistoryPanel } from "./components/url-history-panel";
import { useCrawl } from "@/lib/hooks/use-crawl";
import { startCrawl, stopCrawl } from "@/lib/api/crawl-api";
import type { CrawlStatus, AiMessage } from "./types";

export default function CrawlerInterface() {
  const [url, setUrl] = useState("");
  const [crawlStatus, setCrawlStatus] = useState<CrawlStatus>("idle");
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [pendingAiQuestion, setPendingAiQuestion] = useState<string | null>(
    null,
  );

  const {
    status: crawlHookStatus,
    error: crawlError,
    currentFrame,
    sessionId,
    stats,
    currentUrl,
    urlHistory,
    isConnected,
  } = useCrawl();

  useEffect(() => {
    if (crawlHookStatus === "active") {
      setCrawlStatus("crawling");
    } else if (crawlHookStatus === "completed") {
      setCrawlStatus("completed");
      setAiMessages((prev) => [
        ...prev,
        {
          id: String(prev.length + 1),
          role: "assistant",
          content: `Crawl completed! Found ${stats?.totalDiscovered || 0} pages. ${stats?.visitedCount || 0} pages visited, ${stats?.failedCount || 0} failed.`,
          timestamp: new Date(),
        },
      ]);
    } else if (crawlHookStatus === "error") {
      setCrawlStatus("error");
      if (crawlError) {
        setAiMessages((prev) => [
          ...prev,
          {
            id: String(prev.length + 1),
            role: "assistant",
            content: `Crawl error: ${crawlError}`,
            timestamp: new Date(),
          },
        ]);
      }
    } else if (crawlHookStatus === "idle" && crawlStatus === "crawling") {
      setCrawlStatus("stopped");
    }
  }, [crawlHookStatus, crawlError, stats, crawlStatus]);

  const handleStartCrawl = useCallback(async () => {
    if (!url.trim()) return;

    const fullUrl = url.startsWith("http") ? url : `https://${url}`;

    setAiMessages([
      {
        id: "1",
        role: "assistant",
        content: `Starting crawl of ${fullUrl}. I'll analyze the site structure and discover all pages.`,
        timestamp: new Date(),
      },
    ]);

    try {
      await startCrawl({
        url: fullUrl,
        screencastOptions: {
          quality: 60,
          maxWidth: 1280,
          maxHeight: 720,
        },
        crawlOptions: {
          maxPages: 50,
        },
      });
    } catch (err) {
      console.error("Failed to start crawl:", err);
      setCrawlStatus("error");
      setAiMessages((prev) => [
        ...prev,
        {
          id: String(prev.length + 1),
          role: "assistant",
          content: `Failed to start crawl: ${err instanceof Error ? err.message : "Unknown error"}`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [url]);

  const handleStopCrawl = useCallback(async () => {
    try {
      await stopCrawl();
      setAiMessages((prev) => [
        ...prev,
        {
          id: String(prev.length + 1),
          role: "assistant",
          content: "Crawl stopped by user. You can start a new crawl anytime.",
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error("Failed to stop crawl:", err);
    }
  }, []);

  const handleAiResponse = (response: string) => {
    setAiMessages((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        role: "user",
        content: response,
        timestamp: new Date(),
      },
      {
        id: String(prev.length + 2),
        role: "assistant",
        content: `Got it! I'll ${response.toLowerCase().includes("skip") ? "skip the authenticated section and continue with public pages" : "try to access the protected area with the provided information"}.`,
        timestamp: new Date(),
      },
    ]);
    setPendingAiQuestion(null);
  };

  const handleUrlSelect = useCallback((selectedUrl: string) => {
    console.log("URL selected:", selectedUrl);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-background">
      <CrawlerHeader
        crawlStatus={crawlStatus}
        stats={stats}
        sessionId={sessionId}
      />

      <div className="flex-1 overflow-hidden">
        <div className="grid h-full grid-cols-1 lg:grid-cols-12 gap-0">
          <div className="lg:col-span-12 border-b border-border">
            <UrlInputPanel
              url={url}
              setUrl={setUrl}
              crawlStatus={crawlStatus}
              onStartCrawl={handleStartCrawl}
              onStopCrawl={handleStopCrawl}
            />
          </div>

          <div className="lg:col-span-3 flex flex-col border-r border-border overflow-hidden">
            <div className="p-4 h-full overflow-auto">
              <UrlHistoryPanel
                urlHistory={urlHistory}
                stats={stats}
                onUrlSelect={handleUrlSelect}
              />
            </div>
          </div>

          <div className="lg:col-span-6 border-r border-border">
            <LivePreviewPanel
              currentFrame={currentFrame}
              currentUrl={currentUrl}
              crawlStatus={crawlStatus}
              error={crawlError}
              isConnected={isConnected}
            />
          </div>

          <div className="lg:col-span-3">
            <AiChatPanel
              messages={aiMessages}
              pendingQuestion={pendingAiQuestion}
              onResponse={handleAiResponse}
              crawlStatus={crawlStatus}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
