import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';

import { ContactSortBy } from '../enums/contact-sort-by.enum';
import { SortOrder } from 'src/commom/enums/sort-order.enum';

@InputType()
export class ContactFilterInput {
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

  @Field(() => ContactSortBy, {
    nullable: true,
    defaultValue: ContactSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(ContactSortBy)
  sortBy?: ContactSortBy = ContactSortBy.CREATED_AT;

  @Field(() => SortOrder, {
    nullable: true,
    defaultValue: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
