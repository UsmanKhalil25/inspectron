import type { Page } from "playwright";

export enum VulnerabilitySeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum VulnerabilityType {
  BROKEN_ACCESS_CONTROL = "BROKEN_ACCESS_CONTROL",
  CRYPTOGRAPHIC_FAILURES = "CRYPTOGRAPHIC_FAILURES",
  INJECTION = "INJECTION",
  INSECURE_DESIGN = "INSECURE_DESIGN",
  SECURITY_MISCONFIGURATION = "SECURITY_MISCONFIGURATION",
  VULNERABLE_COMPONENTS = "VULNERABLE_COMPONENTS",
  IDENTIFICATION_FAILURES = "IDENTIFICATION_FAILURES",
  SOFTWARE_INTEGRITY_FAILURES = "SOFTWARE_INTEGRITY_FAILURES",
  LOGGING_FAILURES = "LOGGING_FAILURES",
  SSRF = "SSRF",
}

export type VulnerabilityResult = {
  type: VulnerabilityType;
  severity: VulnerabilitySeverity;
  url: string;
  description: string;
  evidence?: string;
  recommendation?: string;
};

export type ScanResult = {
  url: string;
  vulnerabilities: VulnerabilityResult[];
  scannedAt: Date;
  duration: number;
};

export interface VulnerabilityDetector {
  detect(page: Page, url: string): Promise<VulnerabilityResult[]>;
}
