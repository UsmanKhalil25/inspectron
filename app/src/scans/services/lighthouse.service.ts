import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PubSub } from 'graphql-subscriptions';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';

import { Scan } from '../scans.entity';
import { PerformanceMetric } from '../entities/performance-metric.entity';
import { ScanStatus } from '../enums/scan-status.enum';
import { PUB_SUB, SCAN_STATUS_CHANGED } from '../scans.constants';

export interface LighthouseOpportunity {
  id: string;
  title: string;
  description: string;
  score: number | null;
  displayValue: string | null;
  overallSavingsMs: number | null;
  overallSavingsBytes: number | null;
}

export interface LighthouseDiagnostic {
  id: string;
  title: string;
  description: string;
  score: number | null;
  displayValue: string | null;
}

interface MetricResult {
  numericValue: number;
  score: number;
  displayValue: string;
}

interface CategoryScore {
  score: number;
}

interface AuditResult {
  score: number | null;
  numericValue?: number;
  displayValue?: string;
  title?: string;
  description?: string;
  details?: Record<string, unknown>;
  overallSavingsMs?: number;
  overallSavingsBytes?: number;
}

interface LighthouseResult {
  lhr: {
    categories: Record<string, CategoryScore>;
    audits: Record<string, AuditResult>;
    finalUrl: string;
  };
}

const METRIC_AUDIT_IDS = {
  lcp: 'largest-contentful-paint',
  fcp: 'first-contentful-paint',
  cls: 'cumulative-layout-shift',
  inp: 'interaction-to-next-paint',
  ttfb: 'server-response-time',
  speedIndex: 'speed-index',
  tbt: 'total-blocking-time',
  domContentLoaded: 'dom-content-loaded',
  onLoad: 'load-event',
} as const;

const OPPORTUNITY_AUDIT_IDS = [
  'render-blocking-resources',
  'uses-rel-preload',
  'uses-rel-preconnect',
  'uses-optimized-images',
  'uses-text-compression',
  'uses-responsive-images',
  'offscreen-images',
  'unminified-css',
  'unminified-javascript',
  'unused-css-rules',
  'unused-javascript',
  'modern-image-formats',
  'efficient-animated-content',
  'duplicated-javascript',
  'legacy-javascript',
  'third-party-summary',
] as const;

const DIAGNOSTIC_AUDIT_IDS = [
  'dom-size',
  'mainthread-work-breakdown',
  'bootup-time',
  'network-rtt',
  'network-server-latency',
  'total-byte-weight',
  'long-tasks',
] as const;

@Injectable()
export class LighthouseService {
  private readonly logger = new Logger(LighthouseService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(Scan)
    private readonly scansRepository: Repository<Scan>,
    @InjectRepository(PerformanceMetric)
    private readonly perfMetricRepository: Repository<PerformanceMetric>,
    @Inject(PUB_SUB)
    private readonly pubSub: PubSub,
  ) {}

  async runAudit(scan: Scan): Promise<void> {
    this.logger.log(
      `Starting Lighthouse audit for scan ${scan.id}, URL: ${scan.url}`,
    );

    scan.status = ScanStatus.ACTIVE;
    await this.scansRepository.save(scan);
    await this.pubSub.publish(SCAN_STATUS_CHANGED, {
      [SCAN_STATUS_CHANGED]: scan,
    });

    let chrome: chromeLauncher.LaunchedChrome | undefined;

    try {
      const chromeFlags = this.configService.get<string[]>(
        'lighthouse.chromeFlags',
      ) || [
        '--headless',
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
      ];
      const chromePath = this.configService.get<string>(
        'lighthouse.chromePath',
      );

      const launchOpts: chromeLauncher.Options = {
        chromeFlags,
        ...(chromePath && { chromePath }),
      };

      chrome = await chromeLauncher.launch(launchOpts);

      const numberOfRuns =
        this.configService.get<number>('lighthouse.numberOfRuns') || 1;

      const results: LighthouseResult[] = [];

      for (let i = 0; i < numberOfRuns; i++) {
        this.logger.log(
          `Lighthouse run ${i + 1}/${numberOfRuns} for ${scan.url}`,
        );

        const lhResult = await lighthouse(
          scan.url,
          {
            port: chrome.port,
          },
          {
            extends: 'lighthouse:default',
            settings: {
              onlyCategories: ['performance'],
            },
          },
        );

        if (lhResult) {
          results.push(lhResult as unknown as LighthouseResult);
        }
      }

      if (results.length === 0) {
        throw new Error('Lighthouse returned no results');
      }

      const finalResult = results[results.length - 1];
      const lhr = finalResult.lhr;

      const performanceScore = Math.round(
        (lhr.categories['performance']?.score ?? 0) * 100,
      );

      const audits = lhr.audits;

      const getMetric = (auditId: string): MetricResult => {
        const audit = audits[auditId];
        return {
          numericValue: audit?.numericValue ?? 0,
          score: audit?.score ?? 0,
          displayValue: audit?.displayValue ?? '',
        };
      };

      const lcpMetric = getMetric(METRIC_AUDIT_IDS.lcp);
      const fcpMetric = getMetric(METRIC_AUDIT_IDS.fcp);
      const clsMetric = getMetric(METRIC_AUDIT_IDS.cls);
      const inpMetric = getMetric(METRIC_AUDIT_IDS.inp);
      const ttfbMetric = getMetric(METRIC_AUDIT_IDS.ttfb);
      const siMetric = getMetric(METRIC_AUDIT_IDS.speedIndex);
      const tbtMetric = getMetric(METRIC_AUDIT_IDS.tbt);
      const dclMetric = getMetric(METRIC_AUDIT_IDS.domContentLoaded);
      const onLoadMetric = getMetric(METRIC_AUDIT_IDS.onLoad);

      const resources: Record<string, unknown> = {};
      const resourceSummary = audits['resource-summary'];
      if (resourceSummary?.details) {
        resources['summary'] = resourceSummary.details;
      }
      const totalByteWeight = audits['total-byte-weight'];
      if (totalByteWeight?.details) {
        resources['breakdown'] = totalByteWeight.details;
      }

      const opportunities: LighthouseOpportunity[] = [];
      for (const auditId of OPPORTUNITY_AUDIT_IDS) {
        const audit = audits[auditId];
        if (audit && audit.score !== null && audit.score < 1) {
          opportunities.push({
            id: auditId,
            title: audit.title ?? auditId,
            description: audit.description ?? '',
            score: audit.score,
            displayValue: audit.displayValue ?? null,
            overallSavingsMs: audit.overallSavingsMs ?? null,
            overallSavingsBytes: audit.overallSavingsBytes ?? null,
          });
        }
      }

      const diagnostics: LighthouseDiagnostic[] = [];
      for (const auditId of DIAGNOSTIC_AUDIT_IDS) {
        const audit = audits[auditId];
        if (audit && audit.score !== null && audit.score < 1) {
          diagnostics.push({
            id: auditId,
            title: audit.title ?? auditId,
            description: audit.description ?? '',
            score: audit.score,
            displayValue: audit.displayValue ?? null,
          });
        }
      }

      let totalTransferSize = 0;
      if (totalByteWeight?.numericValue) {
        totalTransferSize = Math.round(totalByteWeight.numericValue);
      }

      let resourceCount = 0;
      const resourceSummaryDetail = resourceSummary?.details as
        | { items?: { requestCount?: number }[] }
        | undefined;
      if (resourceSummaryDetail?.items) {
        resourceCount = resourceSummaryDetail.items.reduce(
          (sum, item) => sum + (item.requestCount ?? 0),
          0,
        );
      }

      const perfMetric = this.perfMetricRepository.create({
        url: lhr.finalUrl || scan.url,
        performanceScore,
        lcp: lcpMetric.numericValue,
        fcp: fcpMetric.numericValue,
        cls: clsMetric.numericValue,
        inp: inpMetric.numericValue,
        ttfb: ttfbMetric.numericValue,
        speedIndex: siMetric.numericValue,
        totalBlockingTime: tbtMetric.numericValue,
        domContentLoaded: dclMetric.numericValue,
        onLoad: onLoadMetric.numericValue,
        totalTransferSize,
        resourceCount,
        resources: JSON.stringify(resources),
        opportunities: JSON.stringify(opportunities),
        diagnostics: JSON.stringify(diagnostics),
        scanId: scan.id,
      });

      await this.perfMetricRepository.save(perfMetric);

      scan.status = ScanStatus.COMPLETED;
      scan.result = JSON.stringify(lhr);
      await this.scansRepository.save(scan);

      const completedScan = await this.scansRepository.findOne({
        where: { id: scan.id },
        relations: ['user', 'project', 'vulnerabilities', 'performanceMetrics'],
      });

      await this.pubSub.publish(SCAN_STATUS_CHANGED, {
        [SCAN_STATUS_CHANGED]: completedScan ?? scan,
      });

      this.logger.log(
        `Lighthouse audit completed for scan ${scan.id}. Performance score: ${performanceScore}`,
      );
    } catch (error) {
      this.logger.error(`Lighthouse audit failed for scan ${scan.id}:`, error);

      scan.status = ScanStatus.FAILED;
      scan.result = JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      });
      await this.scansRepository.save(scan);

      await this.pubSub.publish(SCAN_STATUS_CHANGED, {
        [SCAN_STATUS_CHANGED]: scan,
      });

      throw error;
    } finally {
      if (chrome) {
        await chrome.kill();
      }
    }
  }
}
