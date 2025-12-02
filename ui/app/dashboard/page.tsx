"use client";

import { useState, useCallback } from "react";
import { CrawlerHeader } from "./components/crawler-header";
import { UrlInputPanel } from "./components/url-input-panel";
import { LivePreviewPanel } from "./components/live-preview-panel";
import { AiChatPanel } from "./components/ai-chat-panel";
import type { CrawledPage, CrawlStatus, AiMessage } from "./types";

export default function CrawlerInterface() {
  const [url, setUrl] = useState("");
  const [crawlStatus, setCrawlStatus] = useState<CrawlStatus>("idle");
  const [crawledPages, setCrawledPages] = useState<CrawledPage[]>([]);
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState<string | null>(
    null,
  );
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [pendingAiQuestion, setPendingAiQuestion] = useState<string | null>(
    null,
  );

  const simulateCrawl = useCallback((inputUrl: string) => {
    setCrawlStatus("crawling");
    setCurrentPreviewUrl(inputUrl);
    setCrawledPages([]);
    setAiMessages([
      {
        id: "1",
        role: "assistant",
        content: `Starting crawl of ${inputUrl}. I'll analyze the site structure and discover all pages.`,
        timestamp: new Date(),
      },
    ]);

    // Simulate discovering pages
    const mockPages: CrawledPage[] = [
      {
        id: "1",
        url: inputUrl,
        title: "Homepage",
        status: "crawled",
        depth: 0,
        timestamp: new Date(),
      },
      {
        id: "2",
        url: `${inputUrl}/about`,
        title: "About Us",
        status: "crawling",
        depth: 1,
        timestamp: new Date(),
      },
      {
        id: "3",
        url: `${inputUrl}/products`,
        title: "Products",
        status: "pending",
        depth: 1,
        timestamp: new Date(),
      },
      {
        id: "4",
        url: `${inputUrl}/blog`,
        title: "Blog",
        status: "pending",
        depth: 1,
        timestamp: new Date(),
      },
      {
        id: "5",
        url: `${inputUrl}/contact`,
        title: "Contact",
        status: "pending",
        depth: 1,
        timestamp: new Date(),
      },
    ];

    // Progressively add pages
    let index = 0;
    const interval = setInterval(() => {
      if (index < mockPages.length) {
        setCrawledPages((prev) => {
          const updated = [...prev];
          if (index > 0) {
            updated[index - 1] = { ...updated[index - 1], status: "crawled" };
          }
          updated.push(mockPages[index]);
          return updated;
        });

        // Simulate AI asking a question at page 3
        if (index === 2) {
          setPendingAiQuestion(
            "I found a login-protected area at /dashboard. Should I attempt to crawl authenticated pages? Please provide credentials or skip this section.",
          );
          setAiMessages((prev) => [
            ...prev,
            {
              id: String(prev.length + 1),
              role: "assistant",
              content:
                "I found a login-protected area at /dashboard. Should I attempt to crawl authenticated pages? Please provide credentials or skip this section.",
              timestamp: new Date(),
              requiresInput: true,
            },
          ]);
        }

        index++;
      } else {
        clearInterval(interval);
        setCrawledPages((prev) =>
          prev.map((page) => ({ ...page, status: "crawled" as const })),
        );
        setCrawlStatus("completed");
        setAiMessages((prev) => [
          ...prev,
          {
            id: String(prev.length + 1),
            role: "assistant",
            content: `Crawl completed! Found ${mockPages.length} pages. All pages have been analyzed and indexed.`,
            timestamp: new Date(),
          },
        ]);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const handleStartCrawl = () => {
    if (!url.trim()) return;
    simulateCrawl(url.startsWith("http") ? url : `https://${url}`);
  };

  const handleStopCrawl = () => {
    setCrawlStatus("stopped");
    setAiMessages((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        role: "assistant",
        content: "Crawl stopped by user. You can resume or start a new crawl.",
        timestamp: new Date(),
      },
    ]);
  };

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

  const handlePageSelect = (page: CrawledPage) => {
    setCurrentPreviewUrl(page.url);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <CrawlerHeader
        crawlStatus={crawlStatus}
        pagesCount={crawledPages.length}
      />

      <div className="flex-1 overflow-hidden">
        <div className="grid h-full grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Panel - URL Input & Crawled Pages */}
          <div className="lg:col-span-3 flex flex-col border-r border-border">
            <UrlInputPanel
              url={url}
              setUrl={setUrl}
              crawlStatus={crawlStatus}
              onStartCrawl={handleStartCrawl}
              onStopCrawl={handleStopCrawl}
            />
          </div>

          {/* Center Panel - Live Preview */}
          <div className="lg:col-span-6 border-r border-border">
            <LivePreviewPanel
              url={currentPreviewUrl}
              crawlStatus={crawlStatus}
            />
          </div>

          {/* Right Panel - AI Chat */}
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
