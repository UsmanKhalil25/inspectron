import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentService } from './agents.service';

@Module({
  imports: [ConfigModule],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentsModule {}
