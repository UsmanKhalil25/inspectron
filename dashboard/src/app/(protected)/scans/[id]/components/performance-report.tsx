"use client";

import { useMemo } from "react";
import {
  Gauge,
  Server,
  BarChart3,
  Timer,
  HardDrive,
  Link,
  Zap,
  Activity,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
      return "text-emerald-400";
    case "needs-improvement":
      return "text-amber-400";
    case "poor":
      return "text-red-400";
  }
}

function getRatingDotColor(rating: MetricRating): string {
  switch (rating) {
    case "good":
      return "bg-emerald-400";
    case "needs-improvement":
      return "bg-amber-400";
    case "poor":
      return "bg-red-400";
  }
}

function getRatingLabel(rating: MetricRating): string {
  switch (rating) {
    case "good":
      return "Good";
    case "needs-improvement":
      return "Needs Improvement";
    case "poor":
      return "Poor";
  }
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  return "text-red-400";
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// ─── Components ─────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const segments = 10;
  const filledSegments = Math.round((score / 100) * segments);
  const colorClass =
    score >= 90
      ? "bg-emerald-400"
      : score >= 50
        ? "bg-amber-400"
        : "bg-red-400";

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className={`h-2 w-3 rounded-sm ${i < filledSegments ? colorClass : "bg-muted/30"}`}
        />
      ))}
    </div>
  );
}

interface MetricItemProps {
  metricKey: string;
  value: number;
}

function MetricItem({ metricKey, value }: MetricItemProps) {
  const threshold = METRIC_THRESHOLDS[metricKey];
  const rating = getRating(metricKey, value);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-medium">
        {threshold?.label || metricKey}
      </span>
      <span
        className={`text-2xl font-bold tabular-nums ${getRatingColor(rating)}`}
      >
        {threshold?.format(value) ?? value}
      </span>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full ${getRatingDotColor(rating)}`}
        />
        <span className="text-[11px] text-muted-foreground/80">
          {getRatingLabel(rating)}
        </span>
      </div>
    </div>
  );
}

interface LabMetricProps {
  metricKey: string;
  value: number;
}

function LabMetric({ metricKey, value }: LabMetricProps) {
  const threshold = METRIC_THRESHOLDS[metricKey];
  const rating = getRating(metricKey, value);

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-muted-foreground/60">
        {threshold?.label || metricKey}
      </span>
      <span
        className={`text-sm font-semibold tabular-nums ${getRatingColor(rating)}`}
      >
        {threshold?.format(value) ?? value}
      </span>
    </div>
  );
}

interface PageLoadPillProps {
  icon: React.ElementType;
  value: string;
  label: string;
}

function PageLoadPill({ icon: Icon, value, label }: PageLoadPillProps) {
  return (
    <div className="flex items-center gap-3 px-4">
      <Icon className="h-4 w-4 text-muted-foreground/40 shrink-0" />
      <div className="flex flex-col">
        <span className="text-sm font-medium tabular-nums">{value}</span>
        <span className="text-[11px] text-muted-foreground/60">{label}</span>
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

function OpportunityCard({ opp }: { opp: OpportunityItem }) {
  const hasSavings =
    (opp.overallSavingsMs != null && opp.overallSavingsMs > 0) ||
    (opp.overallSavingsBytes != null && opp.overallSavingsBytes > 0);

  const savingsMs = opp.overallSavingsMs ?? 0;
  const impactColor =
    savingsMs > 500
      ? "border-l-red-400"
      : savingsMs > 200
        ? "border-l-amber-400"
        : "border-l-emerald-400";

  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-lg border border-border/50 bg-muted/5 px-4 py-3 border-l-2 ${impactColor} hover:bg-muted/10 transition-colors`}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
          <span className="text-sm font-medium text-foreground">
            {opp.title}
          </span>
        </div>
        {opp.displayValue && (
          <span className="text-xs text-muted-foreground ml-5.5">
            {opp.displayValue}
          </span>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        {hasSavings && (
          <Badge
            variant="secondary"
            className="text-xs font-medium bg-amber-500/10 text-amber-400 border-amber-500/20"
          >
            {opp.overallSavingsMs != null && opp.overallSavingsMs > 0 && (
              <span>-{Math.round(opp.overallSavingsMs)} ms</span>
            )}
            {opp.overallSavingsBytes != null && opp.overallSavingsBytes > 0 && (
              <span className="ml-1">
                -{formatBytes(opp.overallSavingsBytes)}
              </span>
            )}
          </Badge>
        )}
      </div>
    </div>
  );
}

function DiagnosticCard({ diag }: { diag: DiagnosticItem }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/50 bg-muted/5 px-4 py-3 hover:bg-muted/10 transition-colors">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-3.5 w-3.5 text-blue-400/70 shrink-0" />
        <span className="text-sm text-foreground/80">{diag.title}</span>
      </div>
      {diag.displayValue && (
        <span className="text-xs text-muted-foreground shrink-0">
          {diag.displayValue}
        </span>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

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

  const scoreRating: MetricRating =
    score >= 90 ? "good" : score >= 50 ? "needs-improvement" : "poor";

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* ── Score Hero ─────────────────────────────────────────── */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <span
            className={`text-5xl font-bold tabular-nums ${getScoreColor(score)}`}
          >
            {score}
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-foreground">
              Performance Score
            </span>
            <ScoreBar score={score} />
            <Badge
              variant="secondary"
              className={`mt-1 w-fit text-[10px] font-semibold uppercase tracking-wider border ${
                scoreRating === "good"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : scoreRating === "needs-improvement"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}
            >
              {getRatingLabel(scoreRating)}
            </Badge>
          </div>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* ── Core Web Vitals ────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-muted-foreground/60" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
            Core Web Vitals
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <MetricItem metricKey="lcp" value={lcp} />
          <MetricItem metricKey="cls" value={cls} />
          <MetricItem metricKey="inp" value={inp} />
        </div>
      </section>

      <Separator className="bg-border/50" />

      {/* ── Lab Data ───────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-muted-foreground/60" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
            Lab Data
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <LabMetric metricKey="fcp" value={fcp} />
          <LabMetric metricKey="ttfb" value={ttfb} />
          <LabMetric metricKey="speedIndex" value={si} />
          <LabMetric metricKey="totalBlockingTime" value={tbt} />
        </div>
      </section>

      <Separator className="bg-border/50" />

      {/* ── Page Load Summary ──────────────────────────────────── */}
      <section className="rounded-xl border border-border/40 bg-muted/5 p-4">
        <div className="flex flex-wrap items-center gap-y-4">
          <PageLoadPill
            icon={Timer}
            value={`${(dcl / 1000).toFixed(2)} s`}
            label="DOMContentLoaded"
          />
          <Separator
            orientation="vertical"
            className="h-8 bg-border/40 hidden sm:block"
          />
          <PageLoadPill
            icon={HardDrive}
            value={formatBytes(transferSize)}
            label="Transfer Size"
          />
          <Separator
            orientation="vertical"
            className="h-8 bg-border/40 hidden sm:block"
          />
          <PageLoadPill icon={Link} value={`${resCount}`} label="Requests" />
          <Separator
            orientation="vertical"
            className="h-8 bg-border/40 hidden sm:block"
          />
          <PageLoadPill
            icon={Zap}
            value={`${(onLoad / 1000).toFixed(2)} s`}
            label="On Load"
          />
        </div>
      </section>

      {/* ── Opportunities & Diagnostics ────────────────────────── */}
      {(opportunities.length > 0 || diagnostics.length > 0) && (
        <section>
          <Tabs defaultValue="opportunities" className="w-full">
            <TabsList className="mb-4 bg-muted/50">
              <TabsTrigger value="opportunities" className="gap-1.5 text-xs">
                <Lightbulb className="h-3.5 w-3.5" />
                Opportunities
                {opportunities.length > 0 && (
                  <span className="ml-0.5 text-[10px] text-muted-foreground">
                    ({opportunities.length})
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="diagnostics" className="gap-1.5 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Diagnostics
                {diagnostics.length > 0 && (
                  <span className="ml-0.5 text-[10px] text-muted-foreground">
                    ({diagnostics.length})
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="opportunities" className="mt-0">
              {opportunities.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {opportunities.map((opp) => (
                    <OpportunityCard key={opp.id} opp={opp} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/60">
                  <CheckCircle2 className="h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">No opportunities found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="diagnostics" className="mt-0">
              {diagnostics.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {diagnostics.map((diag) => (
                    <DiagnosticCard key={diag.id} diag={diag} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/60">
                  <CheckCircle2 className="h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">No diagnostics found</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      )}

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground/50 pt-2">
        <Server className="h-3 w-3" />
        <span>
          Measured from:{" "}
          <span className="font-mono text-muted-foreground/70">
            {metric.url ?? "unknown"}
          </span>
        </span>
      </div>
    </div>
  );
}
