import { ObjectType, Field, ID } from '@nestjs/graphql';

import { CommunicationChannel } from 'src/commom/enums/communication-channel.enum';

@ObjectType()
export class ContactChannel {
  @Field(() => ID)
  id: string;

  @Field(() => CommunicationChannel)
  type: CommunicationChannel;

  @Field()
  value: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
