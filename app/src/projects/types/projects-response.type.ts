import { ObjectType, Field } from '@nestjs/graphql';

import { PaginationInfo } from 'src/commom/types/pagination-info.type';
import { Project } from './project.type';

@ObjectType()
export class ProjectsResponse {
  @Field(() => [Project])
  projects: Project[];

  @Field(() => PaginationInfo)
  pagination: PaginationInfo;
}
