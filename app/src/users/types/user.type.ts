import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  lastLoginAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
