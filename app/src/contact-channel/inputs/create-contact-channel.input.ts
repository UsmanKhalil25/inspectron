import { InputType, Field } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { CommunicationChannel } from 'src/commom/enums/communication-channel.enum';
@InputType()
export class CreateContactChannelInput {
  @Field(() => CommunicationChannel)
  @IsEnum(CommunicationChannel)
  type: CommunicationChannel;

  @Field()
  @IsString()
  @IsNotEmpty()
  value: string;
}
