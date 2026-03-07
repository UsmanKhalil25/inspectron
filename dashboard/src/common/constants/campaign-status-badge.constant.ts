import { CampaignStatus } from "@/__generated__/graphql";

export const CAMPAIGN_STATUS_BADGE: Record<
  CampaignStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  [CampaignStatus.Active]: "default",
  [CampaignStatus.Completed]: "secondary",
  [CampaignStatus.Draft]: "secondary",
  [CampaignStatus.Failed]: "destructive",
  [CampaignStatus.Queued]: "outline",
};
