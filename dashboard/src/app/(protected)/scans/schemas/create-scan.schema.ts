import { z } from "zod";
import { ScanStatus, ScanType } from "@/__generated__/types";

export const createScanSchema = z.object({
  url: z
    .string()
    .trim()
    .url("Please enter a valid URL")
    .min(1, "URL is required"),

  scanType: z
    .enum(Object.values(ScanType) as [ScanType, ...ScanType[]])
    .optional(),

  status: z
    .enum(Object.values(ScanStatus) as [ScanStatus, ...ScanStatus[]])
    .nullable()
    .optional(),
});

export type CreateScanFormData = z.infer<typeof createScanSchema>;
