import { gql } from "@/__generated__";

export const SCAN = gql(`
  query GetScan($id: String!) {
    scan(id: $id) {
      id
      url
      status
      runId
      result
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
      vulnerabilities {
        id
        findingId
        title
        severity
        category
        url
        description
        evidence
        remediation
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
