import * as z from "zod";
import type { Page } from "playwright";

import { PageElementSchema } from "../schemas/page-elements.js";

const PredictionSchema = z.object({
  summary: z.string(),
});

export const AgentState = z.object({
  page: z.custom<Page>(),
  input: z.string(),
  img: z.string().optional(), 
  prediction: PredictionSchema.optional(),
  interactiveElements: z.array(PageElementSchema).optional(),
});


export type Prediction = z.infer<typeof PredictionSchema>;
export type AgentStateType = z.infer<typeof AgentState>;
