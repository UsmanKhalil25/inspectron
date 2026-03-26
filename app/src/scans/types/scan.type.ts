import { Field, ObjectType, ID } from '@nestjs/graphql';

import { PublicUser } from 'src/users/types/public-user.type';
import { ScanStatus } from '../enums/scan-status.enum';
import { ScanAction } from './scan-action.type';

@ObjectType()
export class Scan {
  @Field(() => ID)
  id: string;

  @Field()
  url: string;

  @Field(() => ScanStatus)
  status: ScanStatus;

  @Field(() => String, { nullable: true })
  runId?: string;

  @Field(() => String, { nullable: true })
  result?: string;

  @Field(() => [ScanAction], { nullable: true })
  actions?: ScanAction[];

  @Field(() => PublicUser)
  user: PublicUser;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
