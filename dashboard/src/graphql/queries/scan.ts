import { gql } from "@/__generated__";

export const SCAN = gql(`
  query GetScan($id: String!) {
    scan(id: $id) {
      id
      url
      status
      runId
      createdAt
      updatedAt
    }
  }
`);

export const SCAN_SCREENSHOT = gql(`
  query GetScanScreenshot($runId: String!) {
    scanScreenshot(runId: $runId)
  }
`);
