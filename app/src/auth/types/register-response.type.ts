import { Field, ObjectType } from '@nestjs/graphql';
import { PublicUser } from 'src/users/types/public-user.type';

@ObjectType()
export class RegisterResponse {
  @Field()
  message: string;

  @Field(() => PublicUser)
  data: PublicUser;
}
