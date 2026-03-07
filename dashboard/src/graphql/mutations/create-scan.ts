import { gql } from "@/__generated__";

export const CREATE_SCAN = gql(`
  mutation CreateScan($input: CreateScanInput!) {
    createScan(input: $input) {
      id
      url
      status
      createdAt
      updatedAt
    }
  }
`);
