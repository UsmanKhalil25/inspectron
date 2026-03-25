import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PubSub } from 'graphql-subscriptions';
import { Scan } from './scans.entity';
import { ScanAction } from './interfaces/scan-action.interface';
import { ScanStatus } from './enums/scan-status.enum';
import { BrowserAgentService } from './browser-agent.service';
import { PUB_SUB, SCAN_STATUS_CHANGED, SCAN_EVENTS } from './scans.constants';

export interface ScanJobData {
  scanId: string;
  url: string;
}

@Processor('scans')
export class ScanConsumer extends WorkerHost {
  private readonly logger = new Logger(ScanConsumer.name);

  constructor(
    @InjectRepository(Scan)
    private readonly scansRepository: Repository<Scan>,
    @Inject(PUB_SUB)
    private readonly pubSub: PubSub,
    private readonly browserAgentService: BrowserAgentService,
  ) {
    super();
  }

  async process(job: Job<ScanJobData>): Promise<void> {
    const { scanId, url } = job.data;

    this.logger.log(`Processing scan ${scanId} for URL: ${url}`);

    try {
      const scan = await this.scansRepository.findOne({
        where: { id: scanId },
      });

      if (!scan) {
        this.logger.error(`Scan ${scanId} not found`);
        throw new Error(`Scan ${scanId} not found`);
      }

      if (scan.status !== ScanStatus.QUEUED) {
        this.logger.warn(
          `Scan ${scanId} has status "${scan.status}", expected "${ScanStatus.QUEUED}". Skipping.`,
        );
        return;
      }

      scan.status = ScanStatus.ACTIVE;
      await this.scansRepository.save(scan);
      await this.pubSub.publish(SCAN_STATUS_CHANGED, {
        [SCAN_STATUS_CHANGED]: scan,
      });
      this.logger.log(`Scan ${scanId} status updated to ACTIVE`);

      this.logger.log(`Starting scan for URL: ${url}`);

      const runId = await this.browserAgentService.createRun(
        url,
        'Crawl the website. Visit up to 5 pages starting from the homepage. Follow only internal links. Stop after 5 pages.',
      );

      scan.runId = runId;
      scan.actions = [];
      await this.scansRepository.save(scan);

      const onStepEvent = async (action: ScanAction): Promise<void> => {
        scan.actions = [...(scan.actions || []), action];

        await Promise.all([
          this.pubSub.publish(SCAN_EVENTS, {
            scanEvents: {
              scanId: scan.id,
              type: 'step',
              data: action,
            },
          }),
          this.scansRepository.save(scan),
        ]);
      };

      await this.browserAgentService.streamEvents(scan, runId, onStepEvent);

      scan.status = ScanStatus.COMPLETED;
      await this.scansRepository.save(scan);
      await this.pubSub.publish(SCAN_STATUS_CHANGED, {
        [SCAN_STATUS_CHANGED]: scan,
      });
      this.logger.log(`Scan ${scanId} completed successfully`);
    } catch (error) {
      this.logger.error(`Scan ${scanId} failed:`, error);

      const scan = await this.scansRepository.findOne({
        where: { id: scanId },
      });

      if (scan) {
        scan.status = ScanStatus.FAILED;
        await this.scansRepository.save(scan);
        await this.pubSub.publish(SCAN_STATUS_CHANGED, {
          [SCAN_STATUS_CHANGED]: scan,
        });
      }

      throw error;
    }
  }
}
