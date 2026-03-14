import { gql } from "@/__generated__";

export const SCAN_STATUS_CHANGED = gql(`
  subscription ScanStatusChanged($scanId: String!) {
    scanStatusChanged(scanId: $scanId) {
      id
      url
      status
      createdAt
      updatedAt
    }
  }
`);
