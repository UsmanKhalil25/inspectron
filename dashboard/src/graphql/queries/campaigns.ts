import { gql } from "@/__generated__";

export const CAMPAIGNS = gql(`
  query GetCampaigns($filters: CampaignFiltersInput, $limit: Int, $page: Int) {
    campaigns(filters: $filters, limit: $limit, page: $page) {
      campaigns {
        id
        title
        status
        channelType
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
