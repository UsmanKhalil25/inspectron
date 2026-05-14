import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';

import { User } from 'src/users/user.entity';
import { Scan } from './scans.entity';
import { Vulnerability } from './vulnerability.entity';
import { PerformanceMetric } from './entities/performance-metric.entity';
import { Project } from 'src/projects/project.entity';
import { ScansService } from './scans.service';
import { ScansResolver } from './scans.resolver';
import { ScanConsumer } from './scans.consumer';
import { BrowserAgentService } from './browser-agent.service';
import { BrowserPreviewStreamService } from './browser-preview-stream.service';
import { LighthouseService } from './services/lighthouse.service';
import { PUB_SUB, createPubSub } from './scans.constants';
import { lighthouseConfig } from 'src/config/lighthouse.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Scan,
      User,
      Vulnerability,
      PerformanceMetric,
      Project,
    ]),
    BullModule.registerQueue({
      name: 'scans',
    }),
    ConfigModule.forFeature(lighthouseConfig),
  ],
  providers: [
    ScansService,
    ScansResolver,
    ScanConsumer,
    BrowserAgentService,
    BrowserPreviewStreamService,
    LighthouseService,
    {
      provide: PUB_SUB,
      useValue: createPubSub(),
    },
  ],
  exports: [PUB_SUB, BrowserAgentService, BrowserPreviewStreamService],
})
export class ScansModule {}
