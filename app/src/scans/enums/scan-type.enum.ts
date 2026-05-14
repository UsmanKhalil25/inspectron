import { registerEnumType } from '@nestjs/graphql';

export enum ScanType {
  STATIC = 'static',
  DYNAMIC = 'dynamic',
  PERFORMANCE = 'performance',
}

registerEnumType(ScanType, { name: 'ScanType' });
