import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PublicUser {
  @Field()
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
