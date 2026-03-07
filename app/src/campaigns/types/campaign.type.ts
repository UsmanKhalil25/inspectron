import { Field, ObjectType, ID } from '@nestjs/graphql';

import { CampaignStatus } from '../enums/campaign-status.enum';
import { Contact } from 'src/contacts/types/contact.type';
import { PublicUser } from 'src/users/types/public-user.type';
import { CommunicationChannel } from 'src/commom/enums/communication-channel.enum';

@ObjectType()
export class Campaign {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => CommunicationChannel)
  channelType: CommunicationChannel;

  @Field(() => CampaignStatus)
  status: CampaignStatus;

  @Field(() => PublicUser)
  user: PublicUser;

  @Field(() => [Contact])
  contacts: Contact[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
