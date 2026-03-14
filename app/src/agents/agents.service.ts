import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@langchain/langgraph-sdk';

@Injectable()
export class AgentService {
  private client: Client;

  constructor(private configService: ConfigService) {
    this.client = new Client({
      apiUrl:
        this.configService.get<string>('agent.apiUrl') ||
        'http://localhost:2024',
    });
  }

  async createThread() {
    return this.client.threads.create();
  }

  getClient() {
    return this.client;
  }
}
