import { ObjectType, Field } from '@nestjs/graphql';

import { PaginationInfo } from 'src/commom/types/pagination-info.type';
import { Scan } from './scan.type';

@ObjectType()
export class ScansResponse {
  @Field(() => [Scan])
  scans: Scan[];

  @Field(() => PaginationInfo)
  pagination: PaginationInfo;
}
