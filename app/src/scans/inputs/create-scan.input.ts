import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

@InputType()
export class CreateScanInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url: string;
}
