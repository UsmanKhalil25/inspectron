import { gql } from "@/__generated__";

export const SCAN = gql(`
  query GetScan($id: String!) {
    scan(id: $id) {
      id
      url
      status
      runId
      actions {
        step
        timestamp
        thinking
        action {
          name
          display
        }
        context {
          url
          title
        }
      }
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
