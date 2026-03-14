import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PubSub } from 'graphql-subscriptions';
import { Scan } from './scans.entity';
import { ScanStatus } from './enums/scan-status.enum';
import { AgentsBridgeService } from './agents-bridge.service';
import { PUB_SUB, SCAN_STATUS_CHANGED } from './scans.constants';

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
    private readonly agentsBridgeService: AgentsBridgeService,
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

      // Use AgentsBridgeService to execute the scan
      await this.agentsBridgeService.executeScan(scan);

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
