import { gql } from "@/__generated__";

export const START_SCAN = gql(`
  mutation StartScan($id: String!) {
    startScan(id: $id) {
      id
      status
    }
  }
`);
