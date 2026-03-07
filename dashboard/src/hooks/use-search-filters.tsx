import { useMemo } from "react";

export interface SearchFilters {
  filters: Record<string, unknown>;
  limit: number;
  page: number;
}

interface ParamConfig {
  key: string;
  map?: Record<string, unknown>;
}

interface UseMapFiltersOptions {
  params?: ParamConfig[];
  pageSize?: number;
  searchParams: URLSearchParams | Record<string, string>;
}

export function useMapFilters({
  params = [],
  pageSize = 10,
  searchParams,
}: UseMapFiltersOptions): SearchFilters {
  return useMemo(() => {
    const filters: Record<string, unknown> = {};

    const getParam = (key: string): string | null => {
      if (searchParams instanceof URLSearchParams) {
        return searchParams.get(key);
      }
      return searchParams[key] || null;
    };

    const query = getParam("query") || "";
    const pageParam = Number(getParam("page")) || 1;

    if (query.trim()) {
      filters.search = query.trim();
    }

    for (const { key, map } of params) {
      const raw = getParam(key);
      if (!raw) continue;

      const mapped = map ? map[raw.toLowerCase()] : raw;
      if (mapped) {
        filters[key] = mapped;
      }
    }

    return {
      filters,
      limit: pageSize,
      page: Math.max(1, pageParam),
    };
  }, [searchParams, params, pageSize]);
}
