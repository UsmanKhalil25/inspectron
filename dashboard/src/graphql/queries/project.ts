import { gql } from "@/__generated__";

export const PROJECT = gql(`
  query GetProject($id: String!) {
    project(id: $id) {
      id
      name
      url
      description
      scanCount
      lastScanStatus
      createdAt
      updatedAt
    }
  }
`);
