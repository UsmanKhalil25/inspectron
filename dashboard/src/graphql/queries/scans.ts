import { gql } from "@/__generated__";

export const SCANS = gql(`
  query GetScans($filters: ScanFiltersInput, $limit: Int, $page: Int) {
    scans(filters: $filters, limit: $limit, page: $page) {
      scans {
        id
        url
        status
        scanType
        createdAt
        updatedAt
        project {
          id
          name
          url
        }
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
