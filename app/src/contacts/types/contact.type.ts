import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ContactChannel } from 'src/contact-channel/types/contact-channel.type';
import { PublicUser } from 'src/users/types/public-user.type';

@ObjectType()
export class Contact {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => [ContactChannel])
  contactChannels: ContactChannel[];

  @Field(() => PublicUser)
  user: PublicUser;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
