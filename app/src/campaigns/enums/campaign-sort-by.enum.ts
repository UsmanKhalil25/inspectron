import { registerEnumType } from '@nestjs/graphql';

export enum CampaignSortBy {
  CREATED_AT = 'created_at',
  NAME = 'name',
  STATUS = 'status',
  UPDATED_AT = 'updated_at',
}

registerEnumType(CampaignSortBy, {
  name: 'CampaignSortBy',
});
