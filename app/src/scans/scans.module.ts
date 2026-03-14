import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

import { User } from 'src/users/user.entity';
import { Scan } from './scans.entity';
import { ScansService } from './scans.service';
import { ScansResolver } from './scans.resolver';
import { ScanConsumer } from './scan-consumer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Scan, User]),
    BullModule.registerQueue({
      name: 'scans',
    }),
  ],
  providers: [ScansService, ScansResolver, ScanConsumer],
})
export class ScansModule {}
