import { InputType, Field } from '@nestjs/graphql';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateContactInput } from './create-contact.input';

@InputType()
export class BulkCreateContactInput {
  @Field(() => [CreateContactInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContactInput)
  contacts: CreateContactInput[];
}
