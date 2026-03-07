import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

import { CommunicationChannel } from 'src/commom/enums/communication-channel.enum';
import { CampaignStatus } from '../enums/campaign-status.enum';

@InputType()
export class CreateCampaignInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  description: string;

  @Field(() => CommunicationChannel)
  @IsEnum(CommunicationChannel)
  channelType: CommunicationChannel;

  @Field(() => CampaignStatus, { nullable: true })
  @IsEnum(CampaignStatus)
  @IsOptional()
  status?: CampaignStatus;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  contactIds?: string[];
}
