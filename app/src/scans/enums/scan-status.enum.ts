import { registerEnumType } from '@nestjs/graphql';

export enum ScanStatus {
  DRAFT = 'draft',
  QUEUED = 'queued',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

registerEnumType(ScanStatus, {
  name: 'ScanStatus',
});
