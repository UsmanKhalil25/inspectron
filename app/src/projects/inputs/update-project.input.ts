import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsUrl, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateProjectInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}
