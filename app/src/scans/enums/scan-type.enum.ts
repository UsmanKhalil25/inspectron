import { registerEnumType } from '@nestjs/graphql';

export enum ScanType {
  STATIC = 'static',
  DYNAMIC = 'dynamic',
}

registerEnumType(ScanType, { name: 'ScanType' });
