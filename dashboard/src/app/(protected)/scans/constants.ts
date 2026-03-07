import { ScanSortBy, ScanStatus } from "@/__generated__/types";

import { SORT_ORDER_MAP } from "@/common/constants/sort-order.constant";

export const SCANS_STATUS_MAP: Record<string, ScanStatus> = {
  active: ScanStatus.Active,
  queued: ScanStatus.Queued,
  completed: ScanStatus.Completed,
  draft: ScanStatus.Draft,
  failed: ScanStatus.Failed,
} as const;

export const SCANS_SORT_BY: Record<string, ScanSortBy> = {
  created_at: ScanSortBy.CreatedAt,
  updated_at: ScanSortBy.UpdatedAt,
  url: ScanSortBy.Url,
} as const;

export const SCANS_SEARCH_PARAMS = [
  { key: "status", map: SCANS_STATUS_MAP, skipValue: "all" },
  { key: "sortBy", map: SCANS_SORT_BY },
  { key: "sortOrder", map: SORT_ORDER_MAP },
] as const;

export const VALID_SCANS_STATUSES = Object.keys(SCANS_STATUS_MAP);
export const VALID_SCANS_SORT_BY = Object.keys(SCANS_SORT_BY);

export const DEFAULT_SCANS_STATUS = "all";
export const DEFAULT_SCANS_SORT_BY = "created_at";
export const DEFAULT_SCANS_PAGE_SIZE = 10;

export const SCANS_TABLE_TITLE = "All Scans";
export const SCANS_TABLE_DESCRIPTION = "Browse and manage your scans";

export const SCANS_TABLE_COLUMN_WIDTHS = {
  url: "w-[400px]",
  status: "w-[120px]",
  createdAt: "w-[150px]",
  updatedAt: "w-[150px]",
  actions: "w-[70px]",
} as const;

export const SCANS_TABLE_COLUMNS = [
  {
    key: "url",
    header: "URL",
    className: SCANS_TABLE_COLUMN_WIDTHS.url,
  },
  {
    key: "status",
    header: "Status",
    className: SCANS_TABLE_COLUMN_WIDTHS.status,
  },
  {
    key: "createdAt",
    header: "Created",
    className: SCANS_TABLE_COLUMN_WIDTHS.createdAt,
  },
  {
    key: "updatedAt",
    header: "Last Updated",
    className: SCANS_TABLE_COLUMN_WIDTHS.updatedAt,
  },
];
