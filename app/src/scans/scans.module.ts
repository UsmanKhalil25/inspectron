import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';

import { User } from 'src/users/user.entity';
import { Scan } from './scans.entity';
import { ScansService } from './scans.service';
import { ScansResolver } from './scans.resolver';
import { ScanConsumer } from './scans.consumer';
import { BrowserAgentService } from './browser-agent.service';
import { PUB_SUB, createPubSub } from './scans.constants';

@Module({
	imports: [
		TypeOrmModule.forFeature([Scan, User]),
		BullModule.registerQueue({
			name: 'scans',
		}),
		ConfigModule,
	],
	providers: [
		ScansService,
		ScansResolver,
		ScanConsumer,
		BrowserAgentService,
		{
			provide: PUB_SUB,
			useValue: createPubSub(),
		},
	],
	exports: [PUB_SUB, BrowserAgentService],
})
export class ScansModule {}
