import { gql } from "@/__generated__";

export const CREATE_PROJECT = gql(`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
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
