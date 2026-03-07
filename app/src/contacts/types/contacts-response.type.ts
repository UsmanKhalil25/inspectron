import { ObjectType, Field } from '@nestjs/graphql';

import { PaginationInfo } from 'src/commom/types/pagination-info.type';
import { Contact } from './contact.type';

@ObjectType()
export class ContactsResponse {
  @Field(() => [Contact])
  contacts: Contact[];

  @Field(() => PaginationInfo)
  pagination: PaginationInfo;
}
