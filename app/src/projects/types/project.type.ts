import { Field, ObjectType, ID, Int } from '@nestjs/graphql';

import { PublicUser } from 'src/users/types/public-user.type';

@ObjectType()
export class Project {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  url: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => PublicUser)
  user: PublicUser;

  @Field(() => Int)
  scanCount: number;

  @Field(() => String, { nullable: true })
  lastScanStatus: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
