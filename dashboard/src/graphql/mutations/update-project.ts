import { gql } from "@/__generated__";

export const UPDATE_PROJECT = gql(`
  mutation UpdateProject($id: String!, $input: UpdateProjectInput!) {
    updateProject(id: $id, input: $input) {
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
