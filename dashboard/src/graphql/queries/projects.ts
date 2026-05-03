import { gql } from "@/__generated__";

export const PROJECTS = gql(`
  query GetProjects($filters: ProjectFiltersInput, $limit: Int, $page: Int) {
    projects(filters: $filters, limit: $limit, page: $page) {
      projects {
        id
        name
        url
        description
        scanCount
        lastScanStatus
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
