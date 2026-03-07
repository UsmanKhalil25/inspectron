import { ObjectType, Field } from '@nestjs/graphql';

import { PaginationInfo } from 'src/commom/types/pagination-info.type';
import { Campaign } from './campaign.type';

@ObjectType()
export class CampaignsResponse {
  @Field(() => [Campaign])
  campaigns: Campaign[];

  @Field(() => PaginationInfo)
  pagination: PaginationInfo;
}
