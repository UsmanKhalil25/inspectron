import { z } from "zod";

export enum WSMessageType {
  START_SCREENCAST = "start_screencast",
  STOP_SCREENCAST = "stop_screencast",

  SCREENCAST_FRAME = "screencast_frame",
  SCREENCAST_STARTED = "screencast_started",
  SCREENCAST_STOPPED = "screencast_stopped",
  SCREENCAST_ERROR = "screencast_error",

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

export const WSMessageSchema = z.discriminatedUnion("type", [
  StartScreencastSchema,
  StopScreencastSchema,
  ScreencastFrameSchema,
  ScreencastStartedSchema,
  ScreencastStoppedSchema,
  ScreencastErrorSchema,
]);

export type WSMessage = z.infer<typeof WSMessageSchema>;
