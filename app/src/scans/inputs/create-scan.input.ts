import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsUrl,
  IsOptional,
  IsEnum,
} from 'class-validator';

import { ScanStatus } from '../enums/scan-status.enum';
import { ScanType } from '../enums/scan-type.enum';

@InputType()
export class CreateScanInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @Field(() => ScanStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ScanStatus)
  status?: ScanStatus;

  @Field(() => ScanType, { nullable: true })
  @IsOptional()
  @IsEnum(ScanType)
  scanType?: ScanType;
}
