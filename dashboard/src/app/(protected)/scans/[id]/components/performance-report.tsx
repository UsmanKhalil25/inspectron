"use client";

import { useMemo } from "react";
import {
  Gauge,
  Clock,
  LayoutGrid,
  MousePointerClick,
  Server,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface PerformanceMetricData {
  id?: string;
  url?: string;
  performanceScore?: number;
  lcp?: number;
  fcp?: number;
  cls?: number;
  inp?: number;
  ttfb?: number;
  speedIndex?: number;
  totalBlockingTime?: number;
  domContentLoaded?: number;
  onLoad?: number;
  totalTransferSize?: number;
  resourceCount?: number;
  resources?: string | null;
  opportunities?: string | null;
  diagnostics?: string | null;
  scanId?: string;
}

interface PerformanceReportProps {
  performanceMetrics: PerformanceMetricData[];
}

type MetricRating = "good" | "needs-improvement" | "poor";

interface MetricThreshold {
  good: number;
  poor: number;
  unit: string;
  label: string;
  format: (v: number) => string;
}

const METRIC_THRESHOLDS: Record<string, MetricThreshold> = {
  lcp: {
    good: 2500,
    poor: 4000,
    unit: "ms",
    label: "Largest Contentful Paint",
    format: (v) =>
      v >= 1000 ? `${(v / 1000).toFixed(1)} s` : `${Math.round(v)} ms`,
  },
  fcp: {
    good: 1800,
    poor: 3000,
    unit: "ms",
    label: "First Contentful Paint",
    format: (v) =>
      v >= 1000 ? `${(v / 1000).toFixed(1)} s` : `${Math.round(v)} ms`,
  },
  cls: {
    good: 0.1,
    poor: 0.25,
    unit: "",
    label: "Cumulative Layout Shift",
    format: (v) => v.toFixed(3),
  },
  inp: {
    good: 200,
    poor: 500,
    unit: "ms",
    label: "Interaction to Next Paint",
    format: (v) => `${Math.round(v)} ms`,
  },
  ttfb: {
    good: 800,
    poor: 1800,
    unit: "ms",
    label: "Time to First Byte",
    format: (v) => `${Math.round(v)} ms`,
  },
  speedIndex: {
    good: 3400,
    poor: 5800,
    unit: "ms",
    label: "Speed Index",
    format: (v) =>
      v >= 1000 ? `${(v / 1000).toFixed(1)} s` : `${Math.round(v)} ms`,
  },
  totalBlockingTime: {
    good: 200,
    poor: 600,
    unit: "ms",
    label: "Total Blocking Time",
    format: (v) => `${Math.round(v)} ms`,
  },
};

function getRating(key: string, value: number): MetricRating {
  const threshold = METRIC_THRESHOLDS[key];
  if (!threshold) return "needs-improvement";
  if (key === "cls") {
    if (value <= threshold.good) return "good";
    if (value <= threshold.poor) return "needs-improvement";
    return "poor";
  }
  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}

function getRatingColor(rating: MetricRating): string {
  switch (rating) {
    case "good":
      return "text-green-400";
    case "needs-improvement":
      return "text-yellow-400";
    case "poor":
      return "text-red-400";
  }
}

function getRatingBg(rating: MetricRating): string {
  switch (rating) {
    case "good":
      return "bg-green-500/10 border-green-500/30";
    case "needs-improvement":
      return "bg-yellow-500/10 border-yellow-500/30";
    case "poor":
      return "bg-red-500/10 border-red-500/30";
  }
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-400";
  if (score >= 50) return "text-yellow-400";
  return "text-red-400";
}

function getScoreBg(score: number): string {
  if (score >= 90) return "bg-green-500/15 border-green-500/30";
  if (score >= 50) return "bg-yellow-500/15 border-yellow-500/30";
  return "bg-red-500/15 border-red-500/30";
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

interface MetricCardProps {
  metricKey: string;
  value: number;
  icon: React.ElementType;
}

function MetricCard({ metricKey, value, icon: Icon }: MetricCardProps) {
  const threshold = METRIC_THRESHOLDS[metricKey];
  const rating = getRating(metricKey, value);

  return (
    <div className={`rounded-lg border p-3 ${getRatingBg(rating)}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground/60 font-medium">
          {threshold?.label || metricKey}
        </span>
        <Icon className={`h-3.5 w-3.5 ${getRatingColor(rating)}`} />
      </div>
      <div className={`text-lg font-semibold ${getRatingColor(rating)}`}>
        {threshold?.format(value) ?? value}
      </div>
    </div>
  );
}

interface OpportunityItem {
  id: string;
  title: string;
  displayValue: string | null;
  overallSavingsMs: number | null;
  overallSavingsBytes: number | null;
}

interface DiagnosticItem {
  id: string;
  title: string;
  displayValue: string | null;
  score: number | null;
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      <svg className="transform -rotate-90" width="112" height="112">
        <circle
          cx="56"
          cy="56"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className="text-muted/20"
        />
        <circle
          cx="56"
          cy="56"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className={getScoreColor(score)}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
          {score}
        </span>
      </div>
    </div>
  );
}

export function PerformanceReport({
  performanceMetrics,
}: PerformanceReportProps) {
  const metric = performanceMetrics?.[0];

  const opportunities: OpportunityItem[] = useMemo(() => {
    if (!metric?.opportunities) return [];
    try {
      return JSON.parse(metric.opportunities);
    } catch {
      return [];
    }
  }, [metric?.opportunities]);

  const diagnostics: DiagnosticItem[] = useMemo(() => {
    if (!metric?.diagnostics) return [];
    try {
      return JSON.parse(metric.diagnostics);
    } catch {
      return [];
    }
  }, [metric?.diagnostics]);

  if (!metric) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Gauge className="h-10 w-10 mb-3 opacity-30" />
        <p className="text-sm">No performance data available</p>
      </div>
    );
  }

  const score = metric.performanceScore ?? 0;
  const lcp = metric.lcp ?? 0;
  const fcp = metric.fcp ?? 0;
  const cls = metric.cls ?? 0;
  const inp = metric.inp ?? 0;
  const ttfb = metric.ttfb ?? 0;
  const si = metric.speedIndex ?? 0;
  const tbt = metric.totalBlockingTime ?? 0;
  const dcl = metric.domContentLoaded ?? 0;
  const onLoad = metric.onLoad ?? 0;
  const transferSize = metric.totalTransferSize ?? 0;
  const resCount = metric.resourceCount ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Score + Core Web Vitals */}
      <div className="flex gap-6 items-start">
        {/* Performance Score */}
        <div
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${getScoreBg(score)}`}
        >
          <ScoreGauge score={score} />
          <span className="text-xs text-muted-foreground font-medium">
            Performance Score
          </span>
        </div>

        {/* Core Web Vitals */}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Core Web Vitals
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <MetricCard metricKey="lcp" value={lcp} icon={Clock} />
            <MetricCard metricKey="cls" value={cls} icon={LayoutGrid} />
            <MetricCard metricKey="inp" value={inp} icon={MousePointerClick} />
          </div>
          <h3 className="text-sm font-semibold text-foreground mt-4 mb-3">
            Additional Metrics
          </h3>
          <div className="grid grid-cols-4 gap-2">
            <MetricCard metricKey="fcp" value={fcp} icon={Clock} />
            <MetricCard metricKey="ttfb" value={ttfb} icon={Server} />
            <MetricCard metricKey="speedIndex" value={si} icon={BarChart3} />
            <MetricCard
              metricKey="totalBlockingTime"
              value={tbt}
              icon={AlertTriangle}
            />
          </div>
        </div>
      </div>

      {/* Page Load Timings */}
      <div className="rounded-lg border border-border bg-muted/10 p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Page Load Timings
        </h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground text-xs">
              DOMContentLoaded
            </span>
            <p className="font-medium">{(dcl / 1000).toFixed(2)} s</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">On Load</span>
            <p className="font-medium">{(onLoad / 1000).toFixed(2)} s</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Transfer Size</span>
            <p className="font-medium">{formatBytes(transferSize)}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Resources</span>
            <p className="font-medium">{resCount} requests</p>
          </div>
        </div>
      </div>

      {/* Opportunities */}
      {opportunities.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/10 p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-yellow-400" />
            Opportunities ({opportunities.length})
          </h3>
          <div className="space-y-2">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="flex items-center justify-between rounded-md bg-background/50 px-3 py-2 text-sm"
              >
                <span className="text-foreground/80">{opp.title}</span>
                <div className="flex items-center gap-3">
                  {opp.overallSavingsMs != null && opp.overallSavingsMs > 0 && (
                    <span className="text-yellow-400 text-xs font-medium">
                      -{Math.round(opp.overallSavingsMs)} ms
                    </span>
                  )}
                  {opp.overallSavingsBytes != null &&
                    opp.overallSavingsBytes > 0 && (
                      <span className="text-muted-foreground text-xs">
                        -{formatBytes(opp.overallSavingsBytes)}
                      </span>
                    )}
                  {opp.displayValue && (
                    <span className="text-muted-foreground text-xs">
                      {opp.displayValue}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diagnostics */}
      {diagnostics.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/10 p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-400" />
            Diagnostics ({diagnostics.length})
          </h3>
          <div className="space-y-2">
            {diagnostics.map((diag) => (
              <div
                key={diag.id}
                className="flex items-center justify-between rounded-md bg-background/50 px-3 py-2 text-sm"
              >
                <span className="text-foreground/80">{diag.title}</span>
                {diag.displayValue && (
                  <span className="text-muted-foreground text-xs">
                    {diag.displayValue}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scanned URL */}
      <div className="text-xs text-muted-foreground">
        Measured from:{" "}
        <span className="font-mono">{metric.url ?? "unknown"}</span>
      </div>
    </div>
  );
}
