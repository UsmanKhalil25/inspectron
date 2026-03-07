import { z } from "zod";
import { ScanStatus } from "@/__generated__/types";

export const createScanSchema = z.object({
  url: z
    .string()
    .trim()
    .url("Please enter a valid URL")
    .min(1, "URL is required"),

  status: z
    .enum(Object.values(ScanStatus) as [ScanStatus, ...ScanStatus[]])
    .nullable()
    .optional(),
});

export type CreateScanFormData = z.infer<typeof createScanSchema>;
