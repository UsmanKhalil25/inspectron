"use client";

import { useMemo, useState } from "react";
import {
  Shield,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Globe,
  Link,
  Bug,
} from "lucide-react";
import {
  VulnerabilitySeverity,
  VulnerabilityCategory,
} from "@/__generated__/graphql";

export interface VulnerabilityItem {
  id: string;
  findingId: string;
  title: string;
  severity: VulnerabilitySeverity;
  category: VulnerabilityCategory;
  url: string;
  description: string;
  evidence: string;
  remediation: string;
}

interface SecurityReportProps {
  vulnerabilities: VulnerabilityItem[];
  result?: string | null;
}

const SEVERITY_ORDER: VulnerabilitySeverity[] = [
  VulnerabilitySeverity.Critical,
  VulnerabilitySeverity.High,
  VulnerabilitySeverity.Medium,
  VulnerabilitySeverity.Low,
  VulnerabilitySeverity.Info,
];

const SEVERITY_CONFIG: Record<
  VulnerabilitySeverity,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    dot: string;
    text: string;
  }
> = {
  [VulnerabilitySeverity.Critical]: {
    label: "Critical",
    color: "bg-red-500",
    bg: "bg-red-500/10",
    border: "border-l-red-500",
    dot: "bg-red-500",
    text: "text-red-400",
  },
  [VulnerabilitySeverity.High]: {
    label: "High",
    color: "bg-orange-500",
    bg: "bg-orange-500/10",
    border: "border-l-orange-500",
    dot: "bg-orange-500",
    text: "text-orange-400",
  },
  [VulnerabilitySeverity.Medium]: {
    label: "Medium",
    color: "bg-amber-500",
    bg: "bg-amber-500/10",
    border: "border-l-amber-500",
    dot: "bg-amber-500",
    text: "text-amber-400",
  },
  [VulnerabilitySeverity.Low]: {
    label: "Low",
    color: "bg-blue-500",
    bg: "bg-blue-500/10",
    border: "border-l-blue-500",
    dot: "bg-blue-500",
    text: "text-blue-400",
  },
  [VulnerabilitySeverity.Info]: {
    label: "Info",
    color: "bg-muted-foreground",
    bg: "bg-muted/30",
    border: "border-l-muted-foreground",
    dot: "bg-muted-foreground",
    text: "text-muted-foreground",
  },
};

function SeverityBadge({ severity }: { severity: VulnerabilitySeverity }) {
  const config = SEVERITY_CONFIG[severity];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text} border border-current/20`}
    >
      {config.label}
    </span>
  );
}

function SecuritySummary({
  vulnerabilities,
}: {
  vulnerabilities: VulnerabilityItem[];
}) {
  const total = vulnerabilities.length;
  const counts = useMemo(() => {
    return SEVERITY_ORDER.reduce(
      (acc, sev) => {
        acc[sev] = vulnerabilities.filter((v) => v.severity === sev).length;
        return acc;
      },
      {} as Record<VulnerabilitySeverity, number>,
    );
  }, [vulnerabilities]);

  const nonZeroSeverities = SEVERITY_ORDER.filter((sev) => counts[sev] > 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-semibold text-emerald-400">
            No vulnerabilities found
          </span>
          <span className="text-sm text-muted-foreground">
            This scan completed without identifying any security issues.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border/50 bg-muted/5 px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
          <Bug className="h-5 w-5 text-red-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-foreground">
            {total} {total === 1 ? "Finding" : "Findings"}
          </span>
          <span className="text-xs text-muted-foreground">
            Discovered during security scan
          </span>
        </div>
      </div>

      {/* Severity distribution bar */}
      <div className="flex items-center gap-3">
        <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-muted/30">
          {nonZeroSeverities.map((sev) => (
            <div
              key={sev}
              className={`${SEVERITY_CONFIG[sev].color}`}
              style={{
                width: `${(counts[sev] / total) * 100}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Severity counts */}
      <div className="flex flex-wrap items-center gap-2">
        {SEVERITY_ORDER.map((sev) => {
          const count = counts[sev];
          const config = SEVERITY_CONFIG[sev];
          return (
            <div
              key={sev}
              className={`flex items-center gap-1.5 rounded-md px-2 py-1 ${count > 0 ? config.bg : "bg-muted/20"}`}
            >
              <span
                className={`inline-block h-2 w-2 rounded-full ${count > 0 ? config.dot : "bg-muted-foreground/30"}`}
              />
              <span
                className={`text-xs font-medium ${count > 0 ? config.text : "text-muted-foreground/40"}`}
              >
                {count} {config.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SeverityFilter({
  activeFilter,
  onFilterChange,
  vulnerabilities,
}: {
  activeFilter: VulnerabilitySeverity | "all";
  onFilterChange: (filter: VulnerabilitySeverity | "all") => void;
  vulnerabilities: VulnerabilityItem[];
}) {
  const counts = useMemo(() => {
    return SEVERITY_ORDER.reduce(
      (acc, sev) => {
        acc[sev] = vulnerabilities.filter((v) => v.severity === sev).length;
        return acc;
      },
      {} as Record<VulnerabilitySeverity, number>,
    );
  }, [vulnerabilities]);

  const total = vulnerabilities.length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => onFilterChange("all")}
        className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
          activeFilter === "all"
            ? "border-foreground/20 bg-foreground/10 text-foreground"
            : "border-border/50 bg-muted/20 text-muted-foreground hover:bg-muted/40"
        }`}
      >
        All
        <span className="text-[10px] text-muted-foreground/60">{total}</span>
      </button>

      {SEVERITY_ORDER.map((sev) => {
        const count = counts[sev];
        const config = SEVERITY_CONFIG[sev];
        const isActive = activeFilter === sev;

        return (
          <button
            key={sev}
            onClick={() => onFilterChange(sev)}
            disabled={count === 0}
            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              isActive
                ? `${config.bg} ${config.text} border-current/30`
                : "border-border/50 bg-muted/20 text-muted-foreground hover:bg-muted/40"
            }`}
          >
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${config.dot}`}
            />
            {config.label}
            <span className="text-[10px] text-muted-foreground/60">
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function VulnerabilityCard({
  vulnerability,
}: {
  vulnerability: VulnerabilityItem;
}) {
  const [showEvidence, setShowEvidence] = useState(false);
  const [showRemediation, setShowRemediation] = useState(false);
  const config = SEVERITY_CONFIG[vulnerability.severity];

  return (
    <div
      className={`flex flex-col gap-3 rounded-lg border border-border/50 bg-muted/5 p-4 border-l-2 ${config.border} hover:bg-muted/10 transition-colors`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <SeverityBadge severity={vulnerability.severity} />
          <span className="text-sm font-semibold text-foreground leading-tight">
            {vulnerability.title}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground/50 shrink-0 font-mono pt-0.5">
          {vulnerability.findingId}
        </span>
      </div>

      {/* URL */}
      {vulnerability.url && (
        <div className="flex items-center gap-1.5">
          <Link className="h-3 w-3 text-muted-foreground/40 shrink-0" />
          <span className="text-[11px] text-muted-foreground font-mono truncate">
            {vulnerability.url}
          </span>
        </div>
      )}

      {/* Description */}
      {vulnerability.description && (
        <p className="text-sm text-foreground/70 leading-relaxed">
          {vulnerability.description}
        </p>
      )}

      {/* Expandable sections */}
      <div className="flex flex-col gap-2">
        {vulnerability.evidence && (
          <div>
            <button
              onClick={() => setShowEvidence((p) => !p)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {showEvidence ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
              Evidence
            </button>
            {showEvidence && (
              <div className="mt-2 rounded-md bg-muted/40 border border-border/30 px-3 py-2">
                <p className="text-[11px] text-foreground/60 font-mono leading-relaxed whitespace-pre-wrap">
                  {vulnerability.evidence}
                </p>
              </div>
            )}
          </div>
        )}

        {vulnerability.remediation && (
          <div>
            <button
              onClick={() => setShowRemediation((p) => !p)}
              className="flex items-center gap-1.5 text-xs font-medium text-emerald-400/80 hover:text-emerald-400 transition-colors"
            >
              {showRemediation ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
              Remediation
            </button>
            {showRemediation && (
              <div className="mt-2 rounded-md bg-emerald-500/5 border border-emerald-500/15 px-3 py-2">
                <p className="text-[11px] text-foreground/70 leading-relaxed">
                  {vulnerability.remediation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ScannedUrlsSection({ result }: { result?: string | null }) {
  const urls = useMemo(() => {
    if (!result) return [];
    try {
      const parsed = JSON.parse(result);
      if (Array.isArray(parsed.scanned_urls)) {
        return parsed.scanned_urls as string[];
      }
    } catch {
      // ignore parse errors
    }
    return [];
  }, [result]);

  if (urls.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground/50" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          Scanned URLs
        </span>
      </div>
      <div className="flex flex-col gap-1 pl-6">
        {urls.map((url, i) => (
          <div key={i} className="flex items-center gap-2">
            <Link className="h-3 w-3 text-muted-foreground/30 shrink-0" />
            <span className="text-xs text-muted-foreground font-mono truncate">
              {url}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SecurityReport({
  vulnerabilities,
  result,
}: SecurityReportProps) {
  const [activeFilter, setActiveFilter] = useState<
    VulnerabilitySeverity | "all"
  >("all");

  const filteredVulns = useMemo(() => {
    let sorted = [...vulnerabilities].sort(
      (a, b) =>
        SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
    );
    if (activeFilter !== "all") {
      sorted = sorted.filter((v) => v.severity === activeFilter);
    }
    return sorted;
  }, [vulnerabilities, activeFilter]);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Security Summary */}
      <SecuritySummary vulnerabilities={vulnerabilities} />

      {/* Filters */}
      {vulnerabilities.length > 0 && (
        <SeverityFilter
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          vulnerabilities={vulnerabilities}
        />
      )}

      {/* Vulnerability List */}
      {vulnerabilities.length > 0 && (
        <div className="flex flex-col gap-3">
          {filteredVulns.map((vuln) => (
            <VulnerabilityCard key={vuln.id} vulnerability={vuln} />
          ))}
        </div>
      )}

      {/* Scanned URLs */}
      <ScannedUrlsSection result={result} />

      {/* Footer */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground/50 pt-2">
        <Shield className="h-3 w-3" />
        <span>
          Security scan results are based on automated analysis and may not
          cover all potential vulnerabilities.
        </span>
      </div>
    </div>
  );
}
