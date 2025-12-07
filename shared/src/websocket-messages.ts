import { z } from "zod";

export enum WSMessageType {
  START_SCREENCAST = "start_screencast",
  STOP_SCREENCAST = "stop_screencast",

  SCREENCAST_FRAME = "screencast_frame",
  SCREENCAST_STARTED = "screencast_started",
  SCREENCAST_STOPPED = "screencast_stopped",
  SCREENCAST_ERROR = "screencast_error",

  CRAWL_STARTED = "crawl_started",
  CRAWL_STOPPED = "crawl_stopped",
  CRAWL_COMPLETED = "crawl_completed",
  CRAWL_ERROR = "crawl_error",

  URL_DISCOVERED = "url_discovered",
  URL_QUEUED = "url_queued",
  URL_VISITING = "url_visiting",
  URL_VISITED = "url_visited",
  URL_FAILED = "url_failed",

  CRAWL_PROGRESS = "crawl_progress",

  PING = "ping",
  PONG = "pong",
}

export const StartScreencastSchema = z.object({
  type: z.literal(WSMessageType.START_SCREENCAST),
  payload: z.object({
    url: z.string().url(),
    quality: z.number().min(1).max(100).default(60),
    maxWidth: z.number().positive().default(1280),
    maxHeight: z.number().positive().default(720),
  }),
});

export type StartScreencastMessage = z.infer<typeof StartScreencastSchema>;

export const StopScreencastSchema = z.object({
  type: z.literal(WSMessageType.STOP_SCREENCAST),
  payload: z.object({}).optional(),
});

export type StopScreencastMessage = z.infer<typeof StopScreencastSchema>;

export const ScreencastFrameSchema = z.object({
  type: z.literal(WSMessageType.SCREENCAST_FRAME),
  payload: z.object({
    data: z.string(), // base64 encoded JPEG
    metadata: z.object({
      timestamp: z.number(),
      offsetTop: z.number().optional(),
      pageScaleFactor: z.number().optional(),
      deviceWidth: z.number().optional(),
      deviceHeight: z.number().optional(),
      scrollOffsetX: z.number().optional(),
      scrollOffsetY: z.number().optional(),
    }),
  }),
});

export type ScreencastFrameMessage = z.infer<typeof ScreencastFrameSchema>;

export const ScreencastStartedSchema = z.object({
  type: z.literal(WSMessageType.SCREENCAST_STARTED),
  payload: z.object({
    url: z.string(),
    timestamp: z.number(),
  }),
});

export type ScreencastStartedMessage = z.infer<typeof ScreencastStartedSchema>;

export const ScreencastStoppedSchema = z.object({
  type: z.literal(WSMessageType.SCREENCAST_STOPPED),
  payload: z.object({
    timestamp: z.number(),
    reason: z.enum(["user_requested", "error", "completed"]).optional(),
  }),
});

export type ScreencastStoppedMessage = z.infer<typeof ScreencastStoppedSchema>;

export const ScreencastErrorSchema = z.object({
  type: z.literal(WSMessageType.SCREENCAST_ERROR),
  payload: z.object({
    error: z.string(),
    timestamp: z.number(),
  }),
});

export type ScreencastErrorMessage = z.infer<typeof ScreencastErrorSchema>;

export const CrawlStartedSchema = z.object({
  type: z.literal(WSMessageType.CRAWL_STARTED),
  payload: z.object({
    baseUrl: z.string().url(),
    timestamp: z.number(),
    sessionId: z.string(),
  }),
});

export type CrawlStartedMessage = z.infer<typeof CrawlStartedSchema>;

export const CrawlStoppedSchema = z.object({
  type: z.literal(WSMessageType.CRAWL_STOPPED),
  payload: z.object({
    timestamp: z.number(),
    sessionId: z.string(),
    reason: z.enum(["user_requested", "error", "completed"]),
  }),
});

export type CrawlStoppedMessage = z.infer<typeof CrawlStoppedSchema>;

export const CrawlCompletedSchema = z.object({
  type: z.literal(WSMessageType.CRAWL_COMPLETED),
  payload: z.object({
    timestamp: z.number(),
    sessionId: z.string(),
    totalUrls: z.number(),
    visitedCount: z.number(),
    failedCount: z.number(),
  }),
});

export type CrawlCompletedMessage = z.infer<typeof CrawlCompletedSchema>;

export const CrawlErrorSchema = z.object({
  type: z.literal(WSMessageType.CRAWL_ERROR),
  payload: z.object({
    error: z.string(),
    timestamp: z.number(),
    sessionId: z.string(),
  }),
});

export type CrawlErrorMessage = z.infer<typeof CrawlErrorSchema>;

export const UrlDiscoveredSchema = z.object({
  type: z.literal(WSMessageType.URL_DISCOVERED),
  payload: z.object({
    url: z.string().url(),
    timestamp: z.number(),
    sessionId: z.string(),
  }),
});

export type UrlDiscoveredMessage = z.infer<typeof UrlDiscoveredSchema>;

export const UrlQueuedSchema = z.object({
  type: z.literal(WSMessageType.URL_QUEUED),
  payload: z.object({
    url: z.string().url(),
    timestamp: z.number(),
    sessionId: z.string(),
  }),
});

export type UrlQueuedMessage = z.infer<typeof UrlQueuedSchema>;

export const UrlVisitingSchema = z.object({
  type: z.literal(WSMessageType.URL_VISITING),
  payload: z.object({
    url: z.string().url(),
    timestamp: z.number(),
    sessionId: z.string(),
  }),
});

export type UrlVisitingMessage = z.infer<typeof UrlVisitingSchema>;

export const UrlVisitedSchema = z.object({
  type: z.literal(WSMessageType.URL_VISITED),
  payload: z.object({
    url: z.string().url(),
    timestamp: z.number(),
    sessionId: z.string(),
    statusCode: z.number().optional(),
  }),
});

export type UrlVisitedMessage = z.infer<typeof UrlVisitedSchema>;

export const UrlFailedSchema = z.object({
  type: z.literal(WSMessageType.URL_FAILED),
  payload: z.object({
    url: z.string().url(),
    timestamp: z.number(),
    sessionId: z.string(),
    error: z.string(),
    statusCode: z.number().optional(),
  }),
});

export type UrlFailedMessage = z.infer<typeof UrlFailedSchema>;

export const CrawlProgressSchema = z.object({
  type: z.literal(WSMessageType.CRAWL_PROGRESS),
  payload: z.object({
    timestamp: z.number(),
    sessionId: z.string(),
    totalDiscovered: z.number(),
    visitedCount: z.number(),
    queueDepth: z.number(),
    failedCount: z.number(),
    crawlRate: z.number(),
  }),
});

export type CrawlProgressMessage = z.infer<typeof CrawlProgressSchema>;

export const WSMessageSchema = z.discriminatedUnion("type", [
  StartScreencastSchema,
  StopScreencastSchema,
  ScreencastFrameSchema,
  ScreencastStartedSchema,
  ScreencastStoppedSchema,
  ScreencastErrorSchema,
  CrawlStartedSchema,
  CrawlStoppedSchema,
  CrawlCompletedSchema,
  CrawlErrorSchema,
  UrlDiscoveredSchema,
  UrlQueuedSchema,
  UrlVisitingSchema,
  UrlVisitedSchema,
  UrlFailedSchema,
  CrawlProgressSchema,
]);

export type WSMessage = z.infer<typeof WSMessageSchema>;
