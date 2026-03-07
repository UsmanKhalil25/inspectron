import { gql } from "@/__generated__";

export const CAMPAIGN_STATS = gql(`
  query CampaignStats {
    campaignStats {
      totalCampaigns
      campaignsByStatus {
        draft
        queued
        active
        completed
        failed
      }
      campaignsByChannel {
        email
        sms
      }
    }
  }
`);
