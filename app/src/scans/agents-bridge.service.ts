import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PubSub } from 'graphql-subscriptions';
import { Scan } from './scans.entity';
import { ScanStatus } from './enums/scan-status.enum';
import { PUB_SUB, SCAN_STATUS_CHANGED } from './scans.constants';
import { AgentService } from '../agents/agents.service';

@Injectable()
export class AgentsBridgeService {
  private readonly logger = new Logger(AgentsBridgeService.name);

  constructor(
    private readonly agentService: AgentService,
    @InjectRepository(Scan)
    private readonly scansRepository: Repository<Scan>,
    @Inject(PUB_SUB)
    private readonly pubSub: PubSub,
  ) {}

  async executeScan(scan: Scan): Promise<void> {
    this.logger.log(`Starting scan ${scan.id} for URL: ${scan.url}`);

    try {
      // Step 1: Create thread
      const thread = await this.agentService.createThread();
      const threadId = thread.thread_id;

      // Save threadId to scan
      await this.scansRepository.update(scan.id, { threadId });
      this.logger.log(`Created thread ${threadId} for scan ${scan.id}`);

      // Step 2: Stream crawl events
      await this.streamCrawlEvents(scan, threadId);

      // Step 3: Mark as completed
      scan.status = ScanStatus.COMPLETED;
      await this.scansRepository.save(scan);
      await this.pubSub.publish(SCAN_STATUS_CHANGED, {
        [SCAN_STATUS_CHANGED]: scan,
      });
      this.logger.log(`Scan ${scan.id} completed successfully`);
    } catch (error) {
      this.logger.error(`Scan ${scan.id} failed:`, error);

      scan.status = ScanStatus.FAILED;
      await this.scansRepository.save(scan);
      await this.pubSub.publish(SCAN_STATUS_CHANGED, {
        [SCAN_STATUS_CHANGED]: scan,
      });

      throw error;
    }
  }

  private async streamCrawlEvents(scan: Scan, threadId: string): Promise<void> {
    const client = this.agentService.getClient();
    const assistantId = 'agent';

    this.logger.log(`Streaming crawl events for scan ${scan.id}`);

    try {
      const stream = await (client as any).runs.stream(threadId, assistantId, {
        input: {
          messages: [
            {
              type: 'human',
              content: `Crawl the website at ${scan.url}. Visit up to 5 pages starting from the homepage. Follow only internal links. Stop after 5 pages.`,
            },
          ],
        },
        streamMode: 'events',
        config: {
          recursion_limit: 1000,
        },
      });

      for await (const chunk of stream) {
        this.logger.debug(`Event: ${JSON.stringify(chunk)}`);

        const chunkAny = chunk as any;
        
        // Handle navigation events
        if (chunkAny.event === 'on_tool_end' && chunkAny.name === 'navigate') {
          const output = chunkAny.data?.output;
          if (
            output &&
            typeof output === 'string' &&
            output.includes('Navigated to')
          ) {
            const urlMatch = output.match(/Navigated to (.+)/);
            if (urlMatch) {
              const pageUrl = urlMatch[1];
              this.logger.log(`Page crawled: ${pageUrl}`);

              await this.pubSub.publish('SCAN_EVENTS', {
                scanEvents: {
                  scanId: scan.id,
                  type: 'page_crawled',
                  data: { url: pageUrl },
                },
              });
            }
          }
        }

        // Handle vulnerability scan events
        if (
          chunkAny.event === 'on_tool_end' &&
          chunkAny.name === 'scan_vulnerabilities'
        ) {
          this.logger.log(`Vulnerability scan completed for scan ${scan.id}`);

          await this.pubSub.publish('SCAN_EVENTS', {
            scanEvents: {
              scanId: scan.id,
              type: 'vulnerability_scan_completed',
              data: {},
            },
          });
        }
      }

      // Publish completion event
      await this.pubSub.publish('SCAN_EVENTS', {
        scanEvents: {
          scanId: scan.id,
          type: 'completed',
          data: {},
        },
      });

      this.logger.log(`Finished streaming events for scan ${scan.id}`);
    } catch (error) {
      this.logger.error(`Error streaming crawl events:`, error);
      throw error;
    }
  }
}
