import { PageLoader } from "../crawler/page-loader";
import {
  InjectionDetector,
  SecurityHeadersDetector,
  BrokenAuthDetector,
  SensitiveDataDetector,
  BrokenAccessControlDetector,
} from "./detectors";
import type { VulnerabilityDetector, ScanResult } from "./types";

type ScanConfig = {
  headless?: boolean;
  enabledDetectors?: string[];
};

export class ScannerEngine {
  private readonly pageLoader: PageLoader;
  private readonly detectors: VulnerabilityDetector[];

  constructor(
    private readonly targetUrl: string,
    { headless = true, enabledDetectors }: ScanConfig = {},
  ) {
    this.pageLoader = new PageLoader(headless);
    this.detectors = this.initializeDetectors(enabledDetectors);
  }

  private initializeDetectors(
    enabledDetectors?: string[],
  ): VulnerabilityDetector[] {
    const allDetectors = {
      injection: new InjectionDetector(),
      securityHeaders: new SecurityHeadersDetector(),
      brokenAuth: new BrokenAuthDetector(),
      sensitiveData: new SensitiveDataDetector(),
      brokenAccessControl: new BrokenAccessControlDetector(),
    };

    if (!enabledDetectors || enabledDetectors.length === 0) {
      return Object.values(allDetectors);
    }

    return enabledDetectors
      .map((name) => allDetectors[name as keyof typeof allDetectors])
      .filter(Boolean);
  }

  async scan(): Promise<ScanResult> {
    const startTime = Date.now();

    await this.pageLoader.start();

    try {
      const page = await this.pageLoader.load(this.targetUrl);
      console.log(`Scanning: ${this.targetUrl}`);

      const allVulnerabilities = [];

      for (const detector of this.detectors) {
        const detectorName = detector.constructor.name;
        console.log(`Running ${detectorName}...`);

        try {
          const vulnerabilities = await detector.detect(page, this.targetUrl);
          allVulnerabilities.push(...vulnerabilities);

          if (vulnerabilities.length > 0) {
            console.log(`  Found ${vulnerabilities.length} potential issue(s)`);
          }
        } catch (error) {
          console.error(`Error in ${detectorName}:`, error);
        }
      }

      const duration = Date.now() - startTime;

      return {
        url: this.targetUrl,
        vulnerabilities: allVulnerabilities,
        scannedAt: new Date(),
        duration,
      };
    } finally {
      await this.pageLoader.close();
    }
  }
}
