import { Field, ObjectType, ID } from '@nestjs/graphql';

import { PublicUser } from 'src/users/types/public-user.type';

@ObjectType()
export class Scan {
  @Field(() => ID)
  id: string;

  @Field()
  url: string;

  @Field(() => PublicUser)
  user: PublicUser;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
