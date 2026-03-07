import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class RegisterUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  name: string;

  @Field()
  @IsNotEmpty()
  password: string;

  @Field()
  @IsNotEmpty()
  confirmPassword: string;
}
