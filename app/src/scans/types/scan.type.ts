import { Field, ObjectType, ID } from '@nestjs/graphql';

import { PublicUser } from 'src/users/types/public-user.type';
import { ScanStatus } from '../enums/scan-status.enum';

@ObjectType()
export class Scan {
  @Field(() => ID)
  id: string;

  @Field()
  url: string;

  @Field(() => ScanStatus)
  status: ScanStatus;

  @Field(() => PublicUser)
  user: PublicUser;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
