import { CampaignStatus } from "@/__generated__/graphql";

export const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, string> = {
  [CampaignStatus.Draft]: "bg-gray-400",
  [CampaignStatus.Queued]: "bg-blue-500",
  [CampaignStatus.Active]: "bg-yellow-500",
  [CampaignStatus.Completed]: "bg-green-500",
  [CampaignStatus.Failed]: "bg-red-500",
};
