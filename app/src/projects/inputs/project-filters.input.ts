import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsEnum } from 'class-validator';

import { ProjectSortBy } from '../enums/project-sort-by.enum';
import { SortOrder } from 'src/commom/enums/sort-order.enum';

@InputType()
export class ProjectFiltersInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => ProjectSortBy, {
    nullable: true,
    defaultValue: ProjectSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(ProjectSortBy)
  sortBy?: ProjectSortBy = ProjectSortBy.CREATED_AT;

  @Field(() => SortOrder, {
    nullable: true,
    defaultValue: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
