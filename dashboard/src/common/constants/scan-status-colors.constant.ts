import { ScanStatus } from "@/__generated__/graphql";

export const SCAN_STATUS_COLORS: Record<ScanStatus, string> = {
  [ScanStatus.Draft]: "bg-gray-400",
  [ScanStatus.Queued]: "bg-blue-500",
  [ScanStatus.Active]: "bg-yellow-500",
  [ScanStatus.Completed]: "bg-green-500",
  [ScanStatus.Failed]: "bg-red-500",
};
