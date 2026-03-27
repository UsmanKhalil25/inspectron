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

      const task = this.buildTask(url, scan.scanType);

      const runId = await this.browserAgentService.createRun(url, task);

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

  private buildTask(url: string, scanType: ScanType): string {
    const outputFormat = `{"summary":{"critical":0,"high":0,"medium":0,"low":0,"info":0},"findings":[{"id":"VULN-001","title":"...","severity":"critical|high|medium|low|info","category":"...","url":"...","description":"...","evidence":"...","remediation":"..."}],"scanned_urls":["..."],"scan_timestamp":"..."}`;

    if (scanType === ScanType.STATIC) {
      return `You are performing a static web application security scan on ${url}.

PHASE 1 — DISCOVERY:
Visit up to 5 internal pages starting from the homepage. For each page visited, record:
- The full URL
- All HTML forms: their action URL, HTTP method, and input field names
- Any URL parameters present

PHASE 2 — STATIC SECURITY CHECKS:
1. Call get_response_headers() on the homepage.
   - Flag as findings if MISSING: Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
   - Flag as findings if PRESENT: Server, X-Powered-By (information disclosure)

2. Call check_sensitive_endpoint() for each of these paths:
   /.git/HEAD, /.env, /.env.local, /robots.txt, /.htaccess, /phpinfo.php, /admin, /backup.sql, /wp-config.php, /.DS_Store

3. Call evaluate() with script "document.cookie" on each page that has a session. Any visible cookie value means HttpOnly flag is NOT set.

4. For all forms found in Phase 1:
   - Call evaluate() to check if each form has a hidden input with a name containing "csrf", "token", or "_token"
   - Call evaluate() to check if password inputs have autocomplete="off" or autocomplete="new-password"

Do NOT call done until both phases are fully complete.

Allowed categories: security-headers, sensitive-files, cookies, csrf, information-disclosure

Return ONLY a JSON vulnerability report with this exact format (no other text):
${outputFormat}`;
    }

    return `You are performing a DYNAMIC web application security scan on ${url}. You will actively inject payloads to detect exploitable vulnerabilities.

PHASE 1 — DISCOVERY:
Visit up to 5 internal pages starting from the homepage. For each page visited, record:
- The full URL and all query parameter names
- All HTML forms: their action URL, HTTP method, and every input field name and type
- Any links or URLs that contain redirect-like parameter names (redirect, next, return, url, goto, callback, redir, dest, destination, target, forward, location)

PHASE 2 — REFLECTED XSS TESTING:
Test URL parameters and form inputs for reflected XSS. Test at most 3 parameters per page and 3 pages total.

For each URL parameter:
1. Construct the URL with the parameter value set to: <script>window.__xss=1</script>
2. Navigate to that URL
3. Call evaluate() with: JSON.stringify({executed:typeof window.__xss!=='undefined',reflected:document.documentElement.innerHTML.includes('window.__xss=1')})
4. If executed=true → CRITICAL XSS (arbitrary script execution confirmed)
5. If executed=false but reflected=true → HIGH XSS (unencoded reflection, likely exploitable)

For each form input (type text, search, email, tel, url — skip password/hidden):
1. Navigate to the form page
2. Fill the input with: "><img src=x onerror="window.__xss=1">
3. Submit the form (click submit button or call form.submit())
4. Call evaluate() with: JSON.stringify({executed:typeof window.__xss!=='undefined',reflected:document.documentElement.innerHTML.includes('onerror=')})
5. Report accordingly

PHASE 3 — OPEN REDIRECT TESTING:
1. For any URLs found in Phase 1 that contain redirect-like parameters, replace the value with https://example.com and navigate there. After navigation, call evaluate() with: window.location.hostname — if it returns 'example.com', this is a CRITICAL open redirect.
2. Also probe these common redirect entry points by navigating to each and checking window.location.hostname:
   ${url}?redirect=https://example.com
   ${url}?next=https://example.com
   ${url}?url=https://example.com
   ${url}?return=https://example.com
   ${url}?goto=https://example.com

Do NOT call done until all three phases are fully complete.

Allowed categories: xss, open-redirect

Return ONLY a JSON vulnerability report with this exact format (no other text):
${outputFormat}`;
  }

  private async saveVulnerabilities(scan: Scan, result: string): Promise<void> {
    try {
      //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment1
      const parsedResult = JSON.parse(result);
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
