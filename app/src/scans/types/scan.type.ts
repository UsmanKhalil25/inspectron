import { Field, ObjectType, ID } from '@nestjs/graphql';

import { PublicUser } from 'src/users/types/public-user.type';
import { Project } from 'src/projects/types/project.type';
import { ScanStatus } from '../enums/scan-status.enum';
import { ScanType } from '../enums/scan-type.enum';
import { ScanAction } from './scan-action.type';
import { Vulnerability } from './vulnerability.type';
import { PerformanceMetric } from './performance-metric.type';

@ObjectType()
export class Scan {
  @Field(() => ID)
  id: string;

  @Field()
  url: string;

  @Field(() => ScanStatus)
  status: ScanStatus;

  @Field(() => ScanType)
  scanType: ScanType;

  @Field(() => String, { nullable: true })
  runId?: string;

  @Field(() => String, { nullable: true })
  result?: string;

  @Field(() => [ScanAction], { nullable: true })
  actions?: ScanAction[];

  @Field(() => [Vulnerability], { nullable: true })
  vulnerabilities?: Vulnerability[];

  @Field(() => [PerformanceMetric], { nullable: true })
  performanceMetrics?: PerformanceMetric[];

  @Field(() => PublicUser)
  user: PublicUser;

  @Field(() => Project)
  project: Project;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
