import { gql } from "@/__generated__";

export const SCAN_STATS = gql(`
  query GetScanStats {
    scanStats {
      totalScans
      scansByStatus {
        draft
        queued
        active
        completed
        failed
      }
    }
  }
`);
