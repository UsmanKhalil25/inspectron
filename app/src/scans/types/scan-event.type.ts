import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
export class ScanEventData {
  @Field({ nullable: true })
  step?: number;

  @Field({ nullable: true })
  action?: string;

  @Field({ nullable: true })
  goal?: string;

  @Field({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  result?: string;

  @Field({ nullable: true })
  message?: string;
}

@ObjectType()
export class ScanEvent {
  @Field(() => ID)
  scanId: string;

  @Field()
  type: string;

  @Field(() => ScanEventData)
  data: ScanEventData;
}
