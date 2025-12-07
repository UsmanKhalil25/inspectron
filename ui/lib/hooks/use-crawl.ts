import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  WSMessageType,
  type CrawlStartedMessage,
  type CrawlStoppedMessage,
  type CrawlCompletedMessage,
  type CrawlErrorMessage,
  type UrlDiscoveredMessage,
  type UrlQueuedMessage,
  type UrlVisitingMessage,
  type UrlVisitedMessage,
  type UrlFailedMessage,
  type CrawlProgressMessage,
  type ScreencastFrameMessage,
} from "shared";

export type CrawlStatus = "idle" | "active" | "completed" | "error";

export type CrawlStats = {
  totalDiscovered: number;
  visitedCount: number;
  queueDepth: number;
  failedCount: number;
  crawlRate: number;
};

export type UrlStatus = {
  url: string;
  status: "discovered" | "queued" | "visiting" | "visited" | "failed";
  timestamp: number;
  error?: string;
  statusCode?: number;
};

export interface UseCrawlReturn {
  status: CrawlStatus;
  error: string | null;
  currentFrame: string | null;
  sessionId: string | null;
  stats: CrawlStats | null;
  currentUrl: string | null;
  urlHistory: UrlStatus[];
  isConnected: boolean;
}

export function useCrawl(): UseCrawlReturn {
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<CrawlStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [currentFrame, setCurrentFrame] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [stats, setStats] = useState<CrawlStats | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [urlHistory, setUrlHistory] = useState<UrlStatus[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const wsBaseUrl =
      process.env.NEXT_PUBLIC_WS_BASE_URL || "http://localhost:3000";
    const socket = io(`${wsBaseUrl}/crawl`, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Crawl WebSocket connected");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Crawl WebSocket disconnected");
      setIsConnected(false);
    });

    socket.on(WSMessageType.CRAWL_STARTED, (message: CrawlStartedMessage) => {
      console.log("Crawl started:", message.payload);
      setStatus("active");
      setSessionId(message.payload.sessionId);
      setError(null);
      setUrlHistory([]);
      setStats(null);
    });

    socket.on(WSMessageType.CRAWL_STOPPED, (message: CrawlStoppedMessage) => {
      console.log("Crawl stopped:", message.payload);
      setStatus("idle");
      setCurrentUrl(null);
    });

    socket.on(
      WSMessageType.CRAWL_COMPLETED,
      (message: CrawlCompletedMessage) => {
        console.log("Crawl completed:", message.payload);
        setStatus("completed");
        setCurrentUrl(null);
      },
    );

    socket.on(WSMessageType.CRAWL_ERROR, (message: CrawlErrorMessage) => {
      console.error("Crawl error:", message.payload.error);
      setError(message.payload.error);
      setStatus("error");
    });

    socket.on(WSMessageType.URL_DISCOVERED, (message: UrlDiscoveredMessage) => {
      setUrlHistory((prev) => [
        ...prev,
        {
          url: message.payload.url,
          status: "discovered",
          timestamp: message.payload.timestamp,
        },
      ]);
    });

    socket.on(WSMessageType.URL_QUEUED, (message: UrlQueuedMessage) => {
      setUrlHistory((prev) =>
        prev.map((item) =>
          item.url === message.payload.url
            ? {
                ...item,
                status: "queued" as const,
                timestamp: message.payload.timestamp,
              }
            : item,
        ),
      );
    });

    socket.on(WSMessageType.URL_VISITING, (message: UrlVisitingMessage) => {
      setCurrentUrl(message.payload.url);
      setUrlHistory((prev) =>
        prev.map((item) =>
          item.url === message.payload.url
            ? {
                ...item,
                status: "visiting" as const,
                timestamp: message.payload.timestamp,
              }
            : item,
        ),
      );
    });

    socket.on(WSMessageType.URL_VISITED, (message: UrlVisitedMessage) => {
      setUrlHistory((prev) =>
        prev.map((item) =>
          item.url === message.payload.url
            ? {
                ...item,
                status: "visited" as const,
                timestamp: message.payload.timestamp,
                statusCode: message.payload.statusCode,
              }
            : item,
        ),
      );
    });

    socket.on(WSMessageType.URL_FAILED, (message: UrlFailedMessage) => {
      setUrlHistory((prev) =>
        prev.map((item) =>
          item.url === message.payload.url
            ? {
                ...item,
                status: "failed" as const,
                timestamp: message.payload.timestamp,
                error: message.payload.error,
                statusCode: message.payload.statusCode,
              }
            : item,
        ),
      );
    });

    socket.on(WSMessageType.CRAWL_PROGRESS, (message: CrawlProgressMessage) => {
      setStats({
        totalDiscovered: message.payload.totalDiscovered,
        visitedCount: message.payload.visitedCount,
        queueDepth: message.payload.queueDepth,
        failedCount: message.payload.failedCount,
        crawlRate: message.payload.crawlRate,
      });
    });

    socket.on(
      WSMessageType.SCREENCAST_FRAME,
      (message: ScreencastFrameMessage) => {
        setCurrentFrame(message.payload.data);
      },
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  return {
    status,
    error,
    currentFrame,
    sessionId,
    stats,
    currentUrl,
    urlHistory,
    isConnected,
  };
}
