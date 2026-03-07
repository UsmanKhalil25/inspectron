import { IsNotEmpty, IsString, IsArray } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class AddContactsToCampaignInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  campaignId: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  contactIds: string[];
}
