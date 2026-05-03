import { registerEnumType } from '@nestjs/graphql';

export enum ProjectSortBy {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  NAME = 'name',
}

registerEnumType(ProjectSortBy, {
  name: 'ProjectSortBy',
});
