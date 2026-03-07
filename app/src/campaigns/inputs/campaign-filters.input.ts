import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';

import { CampaignSortBy } from '../enums/campaign-sort-by.enum';
import { CampaignStatus } from '../enums/campaign-status.enum';
import { SortOrder } from 'src/commom/enums/sort-order.enum';

@InputType()
export class CampaignFiltersInput {
  @Field(() => String, {
    nullable: true,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => CampaignStatus, {
    nullable: true,
  })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @Field(() => String, {
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @Field(() => String, {
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  createdBefore?: string;

  @Field(() => CampaignSortBy, {
    nullable: true,
    defaultValue: CampaignSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(CampaignSortBy)
  sortBy?: CampaignSortBy = CampaignSortBy.CREATED_AT;

  @Field(() => SortOrder, {
    nullable: true,
    defaultValue: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
