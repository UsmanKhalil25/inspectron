import { gql } from "@/__generated__";

export const SCAN_TREND_STATS = gql(`
  query GetScanTrendStats($days: Int = 30) {
    scanTrendStats(days: $days) {
      date
      scans
      vulnerabilities
    }
  }
`);
