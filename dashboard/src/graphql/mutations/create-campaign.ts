import { gql } from "@/__generated__";

export const CREATE_CAMPAIGN = gql(`
mutation CreateCampaign($input: CreateCampaignInput!) {
  createCampaign(input: $input) {
    id
    title
    description
    channelType
    status
    createdAt
    updatedAt
    contacts {
      id
      name
    }
  }
}`);
