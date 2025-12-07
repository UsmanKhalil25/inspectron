import { z } from "zod";

export const StartCrawlRequestSchema = z.object({
  url: z.string().url(),
  screencastOptions: z
    .object({
      quality: z.number().min(1).max(100).default(60),
      maxWidth: z.number().positive().default(1280),
      maxHeight: z.number().positive().default(720),
    })
    .optional(),
  crawlOptions: z
    .object({
      maxDepth: z.number().positive().optional(),
      maxPages: z.number().positive().optional(),
      respectRobotsTxt: z.boolean().default(true),
    })
    .optional(),
});

export type StartCrawlRequest = z.infer<typeof StartCrawlRequestSchema>;

export const StartCrawlResponseSchema = z.object({
  sessionId: z.string(),
  message: z.string(),
  timestamp: z.number(),
});

export type StartCrawlResponse = z.infer<typeof StartCrawlResponseSchema>;

export const StopCrawlResponseSchema = z.object({
  message: z.string(),
  timestamp: z.number(),
});

export type StopCrawlResponse = z.infer<typeof StopCrawlResponseSchema>;
