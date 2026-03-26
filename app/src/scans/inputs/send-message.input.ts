import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class SendMessageInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  scanId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  content: string;
}
