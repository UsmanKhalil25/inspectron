import { gql } from "@/__generated__";

export const SCANS = gql(`
  query GetScans($filters: ScanFiltersInput, $limit: Int, $page: Int) {
    scans(filters: $filters, limit: $limit, page: $page) {
      scans {
        id
        url
        status
        createdAt
        updatedAt
      }
      pagination {
        total
        page
        totalPages
        limit
        hasNextPage
        hasPreviousPage
      }
    }
  }
`);
