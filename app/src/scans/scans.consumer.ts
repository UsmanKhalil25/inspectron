import { jsonrepair } from 'jsonrepair';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PubSub } from 'graphql-subscriptions';
import { Scan } from './scans.entity';
import { Vulnerability } from './vulnerability.entity';
import { ScanAction } from './interfaces/scan-action.interface';
import { ScanStatus } from './enums/scan-status.enum';
import { ScanType } from './enums/scan-type.enum';
import { BrowserAgentService } from './browser-agent.service';
import { PUB_SUB, SCAN_STATUS_CHANGED, SCAN_EVENTS } from './scans.constants';
import { VulnerabilityReportSchema } from './schemas/vulnerability-report.schema';

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
    @InjectRepository(Vulnerability)
    private readonly vulnerabilityRepository: Repository<Vulnerability>,
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

      const skill =
        scan.scanType === ScanType.STATIC ? 'static-scan' : 'dynamic-scan';
      const runId = await this.browserAgentService.createRun(url, skill);

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

      const { result } = await this.browserAgentService.streamEvents(
        scan,
        runId,
        onStepEvent,
      );

      scan.status = ScanStatus.COMPLETED;
      scan.result = result ?? undefined;
      await this.scansRepository.save(scan);

      if (result) {
        await this.saveVulnerabilities(scan, result);
      }

      // Reload with vulnerabilities so the subscription payload includes them
      const completedScan = await this.scansRepository.findOne({
        where: { id: scan.id },
        relations: ['vulnerabilities'],
      });

      await this.pubSub.publish(SCAN_STATUS_CHANGED, {
        [SCAN_STATUS_CHANGED]: completedScan ?? scan,
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

  private async saveVulnerabilities(scan: Scan, result: string): Promise<void> {
    try {
      let parsedResult: unknown;
      try {
        parsedResult = JSON.parse(result);
      } catch {
        parsedResult = JSON.parse(jsonrepair(result));
      }
      const report = VulnerabilityReportSchema.parse(parsedResult);

      const vulnerabilities = report.findings.map((finding) =>
        this.vulnerabilityRepository.create({
          findingId: finding.id,
          title: finding.title,
          severity: finding.severity,
          category: finding.category,
          url: finding.url,
          description: finding.description,
          evidence: finding.evidence,
          remediation: finding.remediation,
          scanId: scan.id,
        }),
      );

      await this.vulnerabilityRepository.save(vulnerabilities);
      this.logger.log(
        `Saved ${vulnerabilities.length} vulnerabilities for scan ${scan.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to parse/save vulnerabilities for scan ${scan.id}:`,
        error,
      );
    }
  }
}
