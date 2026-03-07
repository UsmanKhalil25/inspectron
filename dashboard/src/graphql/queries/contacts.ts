import { gql } from "@/__generated__";

export const CONTACTS = gql(`
  query GetContacts($filters: ContactFilterInput, $limit: Int, $page: Int) {
    contacts(filters: $filters, limit: $limit, page: $page) {
      contacts {
        id
        name
        createdAt
        updatedAt
        contactChannels {
          id
          type
          value
          createdAt
          updatedAt
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
