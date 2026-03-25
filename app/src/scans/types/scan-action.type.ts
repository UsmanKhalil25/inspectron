import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class ActionDetail {
  @Field()
  name: string;

  @Field()
  params: string; // JSON stringified params

  @Field()
  display: string;
}

@ObjectType()
export class ActionContext {
  @Field()
  url: string;

  @Field()
  title: string;
}

@ObjectType()
export class ScanAction {
  @Field(() => Int)
  step: number;

  @Field(() => String)
  timestamp: string;

  @Field(() => String, { nullable: true })
  thinking: string | null;

  @Field(() => ActionDetail)
  action: ActionDetail;

  @Field(() => ActionContext)
  context: ActionContext;
}
