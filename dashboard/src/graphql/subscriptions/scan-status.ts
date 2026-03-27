import { gql } from "@/__generated__";

export const SCAN_STATUS_CHANGED = gql(`
  subscription ScanStatusChanged($scanId: String!) {
    scanStatusChanged(scanId: $scanId) {
      id
      url
      status
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
