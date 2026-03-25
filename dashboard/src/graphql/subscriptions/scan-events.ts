import { gql } from "@/__generated__";

export const SCAN_EVENTS = gql(`
  subscription ScanEvents($scanId: String!) {
    scanEvents(scanId: $scanId) {
      scanId
      type
      data {
        step
        action
        goal
        url
        result
        message
      }
    }
  }
`);