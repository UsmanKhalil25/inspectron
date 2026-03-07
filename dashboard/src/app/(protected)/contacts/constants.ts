import { ContactSortBy } from "@/__generated__/types";

import { SORT_ORDER_MAP } from "@/common/constants/sort-order.constant";

export const CONTACTS_SORT_BY: Record<string, ContactSortBy> = {
  created_at: ContactSortBy.CreatedAt,
  updated_at: ContactSortBy.UpdatedAt,
  name: ContactSortBy.Name,
} as const;

export const CONTACTS_SEARCH_PARAMS = [
  { key: "sortBy", map: CONTACTS_SORT_BY },
  { key: "sortOrder", map: SORT_ORDER_MAP },
];

export const VALID_CONTACTS_SORT_BY = Object.keys(CONTACTS_SORT_BY);

export const DEFAULT_CONTACTS_STATUS = "all";
export const DEFAULT_CONTACTS_SORT_BY = "created_at";
export const DEFAULT_CONTACTS_PAGE_SIZE = 10;

export const CONTACTS_TABLE_TITLE = "All Contacts";
export const CONTACTS_TABLE_DESCRIPTION = "Browse and manage your contacts";

export const CONTACTS_TABLE_COLUMN_WIDTHS = {
  name: "w-[150px]",
  channels: "w-[300px]",
  updatedAt: "w-[150px]",
  actions: "w-[70px]",
} as const;

export const CONTACTS_TABLE_COLUMNS = [
  {
    key: "name",
    header: "Name",
    className: CONTACTS_TABLE_COLUMN_WIDTHS.name,
  },
  {
    key: "channels",
    header: "Channels",
    className: CONTACTS_TABLE_COLUMN_WIDTHS.channels,
  },
  {
    key: "updatedAt",
    header: "Last Updated",
    className: CONTACTS_TABLE_COLUMN_WIDTHS.updatedAt,
  },
  {
    key: "actions",
    header: "",
    className: CONTACTS_TABLE_COLUMN_WIDTHS.actions,
  },
];
