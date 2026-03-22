import * as z from "zod";
import type { Page } from "playwright";

export const CaptchaState = z.object({
  img: z.string().optional(),
  captchaType: z.string().optional(),
  solved: z.boolean().optional(),
  url: z.string().optional(),
  page: z.custom<Page>().optional(),
});

export type CaptchaStateType = z.infer<typeof CaptchaState>;
