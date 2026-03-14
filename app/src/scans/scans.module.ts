import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

import { User } from 'src/users/user.entity';
import { Scan } from './scans.entity';
import { ScansService } from './scans.service';
import { ScansResolver } from './scans.resolver';
import { ScanConsumer } from './scans.consumer';
import { AgentsBridgeService } from './agents-bridge.service';
import { PUB_SUB, createPubSub } from './scans.constants';
import { AgentsModule } from '../agents/agents.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Scan, User]),
    BullModule.registerQueue({
      name: 'scans',
    }),
    AgentsModule,
  ],
  providers: [
    ScansService,
    ScansResolver,
    ScanConsumer,
    AgentsBridgeService,
    {
      provide: PUB_SUB,
      useValue: createPubSub(),
    },
  ],
  exports: [PUB_SUB, AgentsBridgeService],
})
export class ScansModule {}
