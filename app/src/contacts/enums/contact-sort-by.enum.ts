import { registerEnumType } from '@nestjs/graphql';

export enum ContactSortBy {
  CREATED_AT = 'created_at',
  NAME = 'name',
  UPDATED_AT = 'updated_at',
}

registerEnumType(ContactSortBy, {
  name: 'ContactSortBy',
});
