import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';

import { ScanSortBy } from '../enums/scan-sort-by.enum';
import { SortOrder } from 'src/commom/enums/sort-order.enum';

@InputType()
export class ScanFiltersInput {
  @Field(() => String, {
    nullable: true,
  })
  @IsOptional()
  @IsString()
  search?: string;

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

  @Field(() => ScanSortBy, {
    nullable: true,
    defaultValue: ScanSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(ScanSortBy)
  sortBy?: ScanSortBy = ScanSortBy.CREATED_AT;

  @Field(() => SortOrder, {
    nullable: true,
    defaultValue: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
