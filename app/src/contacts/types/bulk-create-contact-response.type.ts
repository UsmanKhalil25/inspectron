import { ObjectType, Field, Int } from '@nestjs/graphql';

import { Contact } from './contact.type';

@ObjectType()
export class BulkCreateContactError {
  @Field(() => Int)
  index: number;

  @Field()
  error: string;
}

@ObjectType()
export class BulkCreateContactSummary {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  successful: number;

  @Field(() => Int)
  failed: number;
}

@ObjectType()
export class BulkCreateContactResponse {
  @Field(() => [Contact])
  created: Contact[];

  @Field(() => [BulkCreateContactError])
  errors: BulkCreateContactError[];

  @Field(() => BulkCreateContactSummary)
  summary: BulkCreateContactSummary;
}
