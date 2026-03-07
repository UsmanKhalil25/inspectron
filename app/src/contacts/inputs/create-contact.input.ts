import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateContactChannelInput } from 'src/contact-channel/inputs/create-contact-channel.input';

@InputType()
export class CreateContactInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => [CreateContactChannelInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContactChannelInput)
  contactChannels: CreateContactChannelInput[];
}
