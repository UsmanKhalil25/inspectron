import { Field, ObjectType, ID } from '@nestjs/graphql';
import { ScanAction } from './scan-action.type';

@ObjectType()
export class ScanEvent {
  @Field(() => ID)
  scanId: string;

  @Field()
  type: string;

  @Field(() => ScanAction, { nullable: true })
  data?: ScanAction;

  @Field({ nullable: true })
  result?: string;

  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  timestamp?: string;
}
