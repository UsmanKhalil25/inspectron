import * as z from "zod";
import { BoundingBoxSchema } from "./bounding-box.js";

export const PageElementSchema = z.object({
  id: z.number(),
  tag: z.string(),
  text: z.string().nullable(),
  boundingBox: BoundingBoxSchema,
});

export type PageElement = z.infer<typeof PageElementSchema>;
