import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { PdfDocument } from "./pdf-document";
import { COLORS, globalStyles } from "./pdf-styles";
import type { PerformanceMetricData } from "../performance-report";

const styles = StyleSheet.create({
  scoreHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: "bold",
  },
  scoreBarContainer: {
    flexDirection: "row",
    gap: 2,
    marginTop: 4,
  },
  scoreBarSegment: {
    width: 12,
    height: 6,
    borderRadius: 2,
  },
  scoreLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 12,
    flex: 1,
    minWidth: 120,
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  metricRating: {
    fontSize: 8,
    color: COLORS.textMuted,
  },
  pageLoadRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 14,
    marginBottom: 16,
  },
  pageLoadItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 100,
  },
  pageLoadValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  pageLoadLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
  },
  opportunityCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  opportunityTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  opportunityValue: {
    fontSize: 8,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  opportunitySavings: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.amber,
    backgroundColor: COLORS.amberLight,
  },
  diagnosticCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  diagnosticTitle: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  diagnosticValue: {
    fontSize: 8,
    color: COLORS.textMuted,
    textAlign: "right",
  },
  noData: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  noDataText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
});

type MetricRating = "good" | "needs-improvement" | "poor";

interface MetricThreshold {
  good: number;
  poor: number;
  format: (v: number) => string;
  label: string;
}

const METRIC_THRESHOLDS: Record<string, MetricThreshold> = {
  lcp: {
    good: 2500,
    poor: 4000,
    format: (v) =>
      v >= 1000 ? `${(v / 1000).toFixed(1)} s` : `${Math.round(v)} ms`,
    label: "Largest Contentful Paint",
  },
  fcp: {
    good: 1800,
    poor: 3000,
    format: (v) =>
      v >= 1000 ? `${(v / 1000).toFixed(1)} s` : `${Math.round(v)} ms`,
    label: "First Contentful Paint",
  },
  cls: {
    good: 0.1,
    poor: 0.25,
    format: (v) => v.toFixed(3),
    label: "Cumulative Layout Shift",
  },
  inp: {
    good: 200,
    poor: 500,
    format: (v) => `${Math.round(v)} ms`,
    label: "Interaction to Next Paint",
  },
  ttfb: {
    good: 800,
    poor: 1800,
    format: (v) => `${Math.round(v)} ms`,
    label: "Time to First Byte",
  },
  speedIndex: {
    good: 3400,
    poor: 5800,
    format: (v) =>
      v >= 1000 ? `${(v / 1000).toFixed(1)} s` : `${Math.round(v)} ms`,
    label: "Speed Index",
  },
  totalBlockingTime: {
    good: 200,
    poor: 600,
    format: (v) => `${Math.round(v)} ms`,
    label: "Total Blocking Time",
  },
};

function getRating(key: string, value: number): MetricRating {
  const t = METRIC_THRESHOLDS[key];
  if (!t) return "needs-improvement";
  if (key === "cls") {
    if (value <= t.good) return "good";
    if (value <= t.poor) return "needs-improvement";
    return "poor";
  }
  if (value <= t.good) return "good";
  if (value <= t.poor) return "needs-improvement";
  return "poor";
}

function getRatingColor(rating: MetricRating): string {
  switch (rating) {
    case "good":
      return COLORS.emerald;
    case "needs-improvement":
      return COLORS.amber;
    case "poor":
      return COLORS.red;
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
  if (score >= 90) return COLORS.emerald;
  if (score >= 50) return COLORS.amber;
  return COLORS.red;
}

function getScoreRating(score: number): MetricRating {
  if (score >= 90) return "good";
  if (score >= 50) return "needs-improvement";
  return "poor";
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
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

interface PdfPerformanceReportProps {
  scan: {
    id: string;
    url: string;
    status: string;
    scanType: string;
    createdAt: string;
    project?: {
      name: string;
    } | null;
  };
  performanceMetrics: PerformanceMetricData[];
}

export function PdfPerformanceReport({
  scan,
  performanceMetrics,
}: PdfPerformanceReportProps) {
  const metric = performanceMetrics?.[0];

  let opportunities: OpportunityItem[] = [];
  let diagnostics: DiagnosticItem[] = [];

  try {
    if (metric?.opportunities) {
      opportunities = JSON.parse(metric.opportunities);
    }
    if (metric?.diagnostics) {
      diagnostics = JSON.parse(metric.diagnostics);
    }
  } catch {
    // ignore
  }

  if (!metric) {
    return (
      <PdfDocument scan={scan} reportTitle="Performance Report">
        <View style={styles.noData}>
          <Text style={styles.noDataText}>No performance data available</Text>
        </View>
      </PdfDocument>
    );
  }

  const score = metric.performanceScore ?? 0;
  const scoreColor = getScoreColor(score);
  const scoreRating = getScoreRating(score);

  const cwvKeys = ["lcp", "cls", "inp"];
  const labKeys = ["fcp", "ttfb", "speedIndex", "totalBlockingTime"];

  return (
    <PdfDocument scan={scan} reportTitle="Performance Report">
      <View>
        {/* Score Hero */}
        <View style={styles.scoreHero}>
          <Text style={[styles.scoreNumber, { color: scoreColor }]}>
            {score}
          </Text>
          <View>
            <Text style={styles.scoreLabel}>Performance Score</Text>
            <View style={styles.scoreBarContainer}>
              {Array.from({ length: 10 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.scoreBarSegment,
                    {
                      backgroundColor:
                        i < Math.round((score / 100) * 10)
                          ? scoreColor
                          : COLORS.mutedLight,
                    },
                  ]}
                />
              ))}
            </View>
            <Text
              style={[
                styles.badge,
                {
                  backgroundColor:
                    scoreRating === "good"
                      ? COLORS.emeraldLight
                      : scoreRating === "needs-improvement"
                        ? COLORS.amberLight
                        : COLORS.redLight,
                  color: scoreColor,
                },
              ]}
            >
              {getRatingLabel(scoreRating)}
            </Text>
          </View>
        </View>

        <View style={globalStyles.separator} />

        {/* Core Web Vitals */}
        <Text style={globalStyles.sectionTitle}>Core Web Vitals</Text>
        <View style={styles.metricGrid}>
          {cwvKeys.map((key) => {
            const value = (metric as Record<string, unknown>)[key] as number;
            const rating = getRating(key, value);
            const color = getRatingColor(rating);
            const threshold = METRIC_THRESHOLDS[key];
            return (
              <View key={key} style={styles.metricCard}>
                <Text style={styles.metricLabel}>
                  {threshold?.label || key}
                </Text>
                <Text style={[styles.metricValue, { color }]}>
                  {threshold?.format(value) ?? value}
                </Text>
                <Text style={[styles.metricRating, { color }]}>
                  {getRatingLabel(rating)}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={globalStyles.separator} />

        {/* Lab Data */}
        <Text style={globalStyles.sectionTitle}>Lab Data</Text>
        <View style={styles.metricGrid}>
          {labKeys.map((key) => {
            const value = (metric as Record<string, unknown>)[key] as number;
            const rating = getRating(key, value);
            const color = getRatingColor(rating);
            const threshold = METRIC_THRESHOLDS[key];
            return (
              <View key={key} style={styles.metricCard}>
                <Text style={styles.metricLabel}>
                  {threshold?.label || key}
                </Text>
                <Text style={[styles.metricValue, { color }]}>
                  {threshold?.format(value) ?? value}
                </Text>
                <Text style={[styles.metricRating, { color }]}>
                  {getRatingLabel(rating)}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={globalStyles.separator} />

        {/* Page Load Summary */}
        <Text style={globalStyles.sectionTitle}>Page Load Summary</Text>
        <View style={styles.pageLoadRow}>
          <View style={styles.pageLoadItem}>
            <View>
              <Text style={styles.pageLoadValue}>
                {((metric.domContentLoaded ?? 0) / 1000).toFixed(2)} s
              </Text>
              <Text style={styles.pageLoadLabel}>DOMContentLoaded</Text>
            </View>
          </View>
          <View style={styles.pageLoadItem}>
            <View>
              <Text style={styles.pageLoadValue}>
                {formatBytes(metric.totalTransferSize ?? 0)}
              </Text>
              <Text style={styles.pageLoadLabel}>Transfer Size</Text>
            </View>
          </View>
          <View style={styles.pageLoadItem}>
            <View>
              <Text style={styles.pageLoadValue}>
                {metric.resourceCount ?? 0}
              </Text>
              <Text style={styles.pageLoadLabel}>Requests</Text>
            </View>
          </View>
          <View style={styles.pageLoadItem}>
            <View>
              <Text style={styles.pageLoadValue}>
                {((metric.onLoad ?? 0) / 1000).toFixed(2)} s
              </Text>
              <Text style={styles.pageLoadLabel}>On Load</Text>
            </View>
          </View>
        </View>

        {/* Opportunities */}
        {opportunities.length > 0 && (
          <>
            <View style={globalStyles.separator} />
            <Text style={globalStyles.sectionTitle}>Opportunities</Text>
            {opportunities.map((opp) => {
              const savingsMs = opp.overallSavingsMs ?? 0;
              const borderColor =
                savingsMs > 500
                  ? COLORS.red
                  : savingsMs > 200
                    ? COLORS.amber
                    : COLORS.emerald;
              return (
                <View
                  key={opp.id}
                  style={[
                    styles.opportunityCard,
                    { borderLeftColor: borderColor },
                  ]}
                >
                  <View>
                    <Text style={styles.opportunityTitle}>{opp.title}</Text>
                    {opp.displayValue && (
                      <Text style={styles.opportunityValue}>
                        {opp.displayValue}
                      </Text>
                    )}
                  </View>
                  {(opp.overallSavingsMs != null && opp.overallSavingsMs > 0) ||
                  (opp.overallSavingsBytes != null &&
                    opp.overallSavingsBytes > 0) ? (
                    <Text style={styles.opportunitySavings}>
                      {opp.overallSavingsMs != null && opp.overallSavingsMs > 0
                        ? `-${Math.round(opp.overallSavingsMs)} ms`
                        : ""}
                      {opp.overallSavingsBytes != null &&
                      opp.overallSavingsBytes > 0
                        ? ` -${formatBytes(opp.overallSavingsBytes)}`
                        : ""}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </>
        )}

        {/* Diagnostics */}
        {diagnostics.length > 0 && (
          <>
            <View style={globalStyles.separator} />
            <Text style={globalStyles.sectionTitle}>Diagnostics</Text>
            {diagnostics.map((diag) => (
              <View key={diag.id} style={styles.diagnosticCard}>
                <Text style={styles.diagnosticTitle}>{diag.title}</Text>
                {diag.displayValue && (
                  <Text style={styles.diagnosticValue}>
                    {diag.displayValue}
                  </Text>
                )}
              </View>
            ))}
          </>
        )}

        {/* Footer meta */}
        <View style={[globalStyles.separator, { marginTop: 20 }]} />
        <Text style={{ fontSize: 8, color: COLORS.textMuted }}>
          Measured from: {metric.url ?? "unknown"}
        </Text>
      </View>
    </PdfDocument>
  );
}
