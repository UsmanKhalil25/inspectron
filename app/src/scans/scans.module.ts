import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from 'src/users/user.entity';
import { Scan } from './scans.entity';
import { ScansService } from './scans.service';
import { ScansResolver } from './scans.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Scan, User])],
  providers: [ScansService, ScansResolver],
})
export class ScansModule {}
