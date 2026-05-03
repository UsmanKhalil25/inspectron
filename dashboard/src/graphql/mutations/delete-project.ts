import { gql } from "@/__generated__";

export const DELETE_PROJECT = gql(`
  mutation DeleteProject($id: String!) {
    deleteProject(id: $id)
  }
`);
