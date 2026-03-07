import { registerEnumType } from '@nestjs/graphql';

export enum CampaignStatus {
  DRAFT = 'draft',
  QUEUED = 'queued',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

registerEnumType(CampaignStatus, {
  name: 'CampaignStatus',
});
