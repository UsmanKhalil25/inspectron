import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class ScanAction {
  @Field(() => Int)
  step: number;

  @Field()
  action: string;

  @Field()
  goal: string;

  @Field()
  url: string;

  @Field(() => String)
  timestamp: string;
}
