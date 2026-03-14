import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scan } from './scans.entity';
import { ScanStatus } from './enums/scan-status.enum';

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
      this.logger.log(`Scan ${scanId} status updated to ACTIVE`);

      this.logger.log(`Starting scan for URL: ${url}`);

      await this.simulateScan(url);

      scan.status = ScanStatus.COMPLETED;
      await this.scansRepository.save(scan);
      this.logger.log(`Scan ${scanId} completed successfully`);
    } catch (error) {
      this.logger.error(`Scan ${scanId} failed:`, error);

      const scan = await this.scansRepository.findOne({
        where: { id: scanId },
      });

      if (scan) {
        scan.status = ScanStatus.FAILED;
        await this.scansRepository.save(scan);
      }

      throw error;
    }
  }

  private async simulateScan(url: string): Promise<void> {
    this.logger.log(`Scanning URL: ${url}`);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    this.logger.log(`Scan completed for URL: ${url}`);
  }
}
