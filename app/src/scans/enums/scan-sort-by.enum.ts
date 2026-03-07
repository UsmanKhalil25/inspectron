import { registerEnumType } from '@nestjs/graphql';

export enum ScanSortBy {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  URL = 'url',
}

registerEnumType(ScanSortBy, {
  name: 'ScanSortBy',
});
