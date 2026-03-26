import { Field, ObjectType, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class BrowserPreviewFrame {
  @Field(() => ID)
  runId: string;

  @Field()
  frame: string;

  @Field()
  timestamp: number;

  @Field(() => Int)
  frameNumber: number;

  @Field(() => Int)
  latencyMs: number;

  @Field(() => String, { nullable: true })
  url?: string;
}
