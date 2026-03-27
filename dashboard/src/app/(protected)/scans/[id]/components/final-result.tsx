"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  VulnerabilityCategory,
  VulnerabilitySeverity,
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

interface FinalResultProps {
  result: string;
  type: "completed" | "error";
  timestamp: string;
  vulnerabilities?: VulnerabilityItem[] | null;
}

const SEVERITY_ORDER: VulnerabilitySeverity[] = [
  VulnerabilitySeverity.Critical,
  VulnerabilitySeverity.High,
  VulnerabilitySeverity.Medium,
  VulnerabilitySeverity.Low,
  VulnerabilitySeverity.Info,
];

const SEVERITY_STYLES: Record<
  VulnerabilitySeverity,
  { badge: string; border: string; label: string; pill: string }
> = {
  [VulnerabilitySeverity.Critical]: {
    badge: "bg-red-600 text-white",
    border: "border-red-600/30",
    label: "Critical",
    pill: "bg-red-600/15 text-red-400",
  },
  [VulnerabilitySeverity.High]: {
    badge: "bg-orange-500 text-white",
    border: "border-orange-500/30",
    label: "High",
    pill: "bg-orange-500/15 text-orange-400",
  },
  [VulnerabilitySeverity.Medium]: {
    badge: "bg-yellow-500 text-black",
    border: "border-yellow-500/30",
    label: "Medium",
    pill: "bg-yellow-500/15 text-yellow-400",
  },
  [VulnerabilitySeverity.Low]: {
    badge: "bg-blue-500 text-white",
    border: "border-blue-500/30",
    label: "Low",
    pill: "bg-blue-500/15 text-blue-400",
  },
  [VulnerabilitySeverity.Info]: {
    badge: "bg-muted text-muted-foreground",
    border: "border-border",
    label: "Info",
    pill: "bg-muted/50 text-muted-foreground",
  },
};

function SeverityBadge({ severity }: { severity: VulnerabilitySeverity }) {
  const styles = SEVERITY_STYLES[severity];
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${styles.badge}`}
    >
      {styles.label}
    </span>
  );
}

function SummaryPills({
  vulnerabilities,
}: {
  vulnerabilities: VulnerabilityItem[];
}) {
  const counts = SEVERITY_ORDER.reduce(
    (acc, sev) => {
      acc[sev] = vulnerabilities.filter((v) => v.severity === sev).length;
      return acc;
    },
    {} as Record<VulnerabilitySeverity, number>,
  );

  const nonZero = SEVERITY_ORDER.filter((sev) => counts[sev] > 0);
  if (nonZero.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {nonZero.map((sev) => {
        const styles = SEVERITY_STYLES[sev];
        return (
          <span
            key={sev}
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${styles.pill}`}
          >
            {counts[sev]} {styles.label}
          </span>
        );
      })}
    </div>
  );
}

function VulnReport({
  vulnerabilities,
}: {
  vulnerabilities: VulnerabilityItem[];
}) {
  const sortedFindings = [...vulnerabilities].sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
  );

  return (
    <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-border/50">
      {sortedFindings.map((finding) => {
        const borderStyle = SEVERITY_STYLES[finding.severity].border;
        return (
          <div
            key={finding.id}
            className={`rounded-lg border ${borderStyle} bg-muted/20 p-3 flex flex-col gap-2`}
          >
            <div className="flex items-start gap-2 justify-between">
              <div className="flex items-start gap-2 min-w-0">
                <SeverityBadge severity={finding.severity} />
                <span className="text-sm font-medium text-foreground leading-tight">
                  {finding.title}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground/50 shrink-0 pt-0.5 font-mono">
                {finding.findingId}
              </span>
            </div>

            {finding.url && (
              <p className="text-[11px] text-muted-foreground font-mono truncate">
                {finding.url}
              </p>
            )}

            {finding.description && (
              <p className="text-xs text-foreground/70 leading-relaxed">
                {finding.description}
              </p>
            )}

            {finding.evidence && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground/50 font-medium">
                  Evidence
                </span>
                <p className="text-[11px] text-foreground/60 font-mono bg-muted/40 rounded px-2 py-1">
                  {finding.evidence}
                </p>
              </div>
            )}

            {finding.remediation && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground/50 font-medium">
                  Remediation
                </span>
                <p className="text-[11px] text-foreground/70 leading-relaxed">
                  {finding.remediation}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function FinalResult({
  result,
  type,
  timestamp,
  vulnerabilities,
}: FinalResultProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const hasStructuredVulns = vulnerabilities && vulnerabilities.length > 0;

  return (
    <div className="flex flex-col gap-1">
      {/* Collapsible header */}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex items-center gap-2 text-left"
      >
        <ChevronRight
          className={`h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform duration-200 ${
            isExpanded ? "rotate-90" : ""
          }`}
        />
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span
            className={`text-sm font-medium ${
              type === "error" ? "text-red-400" : "text-foreground/80"
            }`}
          >
            {type === "error" ? "Scan failed" : "Scan complete"}
          </span>
          <span className="text-[10px] text-muted-foreground/40">
            {formattedTime}
          </span>
          {!isExpanded && hasStructuredVulns && (
            <SummaryPills vulnerabilities={vulnerabilities} />
          )}
        </div>
      </button>

      {/* Expandable content */}
      <div
        className={`grid transition-all duration-200 ${
          isExpanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden pl-6">
          <p
            className={`text-sm leading-relaxed whitespace-pre-wrap ${
              type === "error" ? "text-red-400/80" : "text-foreground/70"
            }`}
          >
            {result}
          </p>

          {/* Structured vulnerability report */}
          {hasStructuredVulns && (
            <VulnReport vulnerabilities={vulnerabilities} />
          )}
        </div>
      </div>
    </div>
  );
}
