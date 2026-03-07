import { Field, ObjectType } from '@nestjs/graphql';
import { PublicUser } from 'src/users/types/public-user.type';

@ObjectType()
export class LoginResponse {
  @Field()
  message: string;

  @Field()
  user: PublicUser;
}
