import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Project } from './project.entity';
import { User } from 'src/users/user.entity';
import { Scan } from 'src/scans/scans.entity';
import { Vulnerability } from 'src/scans/vulnerability.entity';
import { ProjectsService } from './projects.service';
import { ProjectsResolver } from './projects.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Project, User, Scan, Vulnerability])],
  providers: [ProjectsService, ProjectsResolver],
  exports: [ProjectsService],
})
export class ProjectsModule {}
