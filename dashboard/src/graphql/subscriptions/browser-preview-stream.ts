import { gql } from "@/__generated__";

export const BROWSER_PREVIEW_STREAM = gql(`
  subscription BrowserPreviewStream($runId: String!) {
    browserPreviewStream(runId: $runId) {
      runId
      frame
      timestamp
      frameNumber
      latencyMs
      url
    }
  }
`);
