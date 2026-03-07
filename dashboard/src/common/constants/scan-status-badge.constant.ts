import { ScanStatus } from "@/__generated__/graphql";

export const SCAN_STATUS_BADGE: Record<
  ScanStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  [ScanStatus.Active]: "default",
  [ScanStatus.Completed]: "secondary",
  [ScanStatus.Draft]: "secondary",
  [ScanStatus.Failed]: "destructive",
  [ScanStatus.Queued]: "outline",
};
