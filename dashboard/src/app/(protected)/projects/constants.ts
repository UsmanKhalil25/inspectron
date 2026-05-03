import { ScanStatus } from "@/__generated__/graphql";
import { SORT_ORDER_MAP } from "@/common/constants/sort-order.constant";

export const PROJECT_SORT_BY: Record<string, string> = {
  created_at: "CREATED_AT",
  updated_at: "UPDATED_AT",
  name: "NAME",
} as const;

export const PROJECTS_SEARCH_PARAMS = [
  { key: "sortBy", map: PROJECT_SORT_BY },
  { key: "sortOrder", map: SORT_ORDER_MAP },
] as const;

export const DEFAULT_PROJECTS_STATUS = "all";
export const DEFAULT_PROJECTS_PAGE_SIZE = 10;

export const PROJECTS_TABLE_TITLE = "All Projects";
export const PROJECTS_TABLE_DESCRIPTION = "Browse and manage your projects";

export const PROJECTS_TABLE_COLUMNS = [
  { key: "name", header: "Name", className: "w-[250px]" },
  { key: "url", header: "URL", className: "min-w-[200px]" },
  { key: "scanCount", header: "Scans", className: "w-[100px]" },
  { key: "lastScanStatus", header: "Last Scan", className: "w-[120px]" },
  { key: "createdAt", header: "Created", className: "w-[150px]" },
];

export const PROJECT_STATUS_COLORS: Record<string, string> = {
  [ScanStatus.Draft]: "bg-gray-400",
  [ScanStatus.Queued]: "bg-blue-500",
  [ScanStatus.Active]: "bg-yellow-500",
  [ScanStatus.Completed]: "bg-green-500",
  [ScanStatus.Failed]: "bg-red-500",
};
