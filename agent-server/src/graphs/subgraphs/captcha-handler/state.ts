import * as z from "zod";

export const CaptchaState = z.object({
  img: z.string().optional(),
  captchaType: z.string().optional(),
  solved: z.boolean().optional(),
  url: z.string().optional(),
});

export type CaptchaStateType = z.infer<typeof CaptchaState>;
