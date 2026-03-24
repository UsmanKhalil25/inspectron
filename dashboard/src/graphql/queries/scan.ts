import { gql } from "@/__generated__";

export const SCAN = gql(`
  query GetScan($id: String!) {
    scan(id: $id) {
      id
      url
      status
      createdAt
      updatedAt
    }
  }
`);
