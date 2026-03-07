import { CampaignSortBy, CampaignStatus } from "@/__generated__/types";

import { SORT_ORDER_MAP } from "@/common/constants/sort-order.constant";

export const CAMPAIGNS_STATUS_MAP: Record<string, CampaignStatus> = {
  active: CampaignStatus.Active,
  queued: CampaignStatus.Queued,
  completed: CampaignStatus.Completed,
  draft: CampaignStatus.Draft,
  failed: CampaignStatus.Failed,
} as const;

export const CAMPAIGNS_SORT_BY: Record<string, CampaignSortBy> = {
  created_at: CampaignSortBy.CreatedAt,
  updated_at: CampaignSortBy.UpdatedAt,
  name: CampaignSortBy.Name,
  status: CampaignSortBy.Status,
} as const;

export const CAMPAIGNS_SEARCH_PARAMS = [
  { key: "status", map: CAMPAIGNS_STATUS_MAP, skipValue: "all" },
  { key: "sortBy", map: CAMPAIGNS_SORT_BY },
  { key: "sortOrder", map: SORT_ORDER_MAP },
] as const;

export const VALID_CAMPAIGNS_STATUSES = Object.keys(CAMPAIGNS_STATUS_MAP);
export const VALID_CAMPAIGNS_SORT_BY = Object.keys(CAMPAIGNS_SORT_BY);

export const DEFAULT_CAMPAIGNS_STATUS = "all";
export const DEFAULT_CAMPAIGNS_SORT_BY = "created_at";
export const DEFAULT_CAMPAIGNS_PAGE_SIZE = 10;

export const CAMPAIGNS_TABLE_TITLE = "All Campaigns";
export const CAMPAIGNS_TABLE_DESCRIPTION = "Browse and manage your campaigns";

export const CAMPAIGNS_TABLE_COLUMN_WIDTHS = {
  title: "w-[300px]",
  channelType: "w-[150px]",
  status: "w-[120px]",
  updatedAt: "w-[150px]",
  actions: "w-[70px]",
} as const;

export const CAMPAIGNS_TABLE_COLUMNS = [
  {
    key: "title",
    header: "Campaign Name",
    className: CAMPAIGNS_TABLE_COLUMN_WIDTHS.title,
  },
  {
    key: "channelType",
    header: "Type",
    className: CAMPAIGNS_TABLE_COLUMN_WIDTHS.channelType,
  },
  {
    key: "status",
    header: "Status",
    className: CAMPAIGNS_TABLE_COLUMN_WIDTHS.status,
  },
  {
    key: "updatedAt",
    header: "Last Updated",
    className: CAMPAIGNS_TABLE_COLUMN_WIDTHS.updatedAt,
  },
  {
    key: "actions",
    header: "",
    className: CAMPAIGNS_TABLE_COLUMN_WIDTHS.actions,
  },
];
