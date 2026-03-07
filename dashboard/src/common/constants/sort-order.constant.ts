import { SortOrder } from "@/__generated__/types";

export const SORT_ORDER_MAP: Record<string, SortOrder> = {
  asc: SortOrder.Asc,
  desc: SortOrder.Desc,
} as const;

export const VALID_SORT_ORDER = Object.keys(SORT_ORDER_MAP);

export const DEFAULT_SORT_ORDER = "desc";
