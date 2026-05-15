import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { PdfDocument } from "./pdf-document";
import {
  COLORS,
  globalStyles,
  SEVERITY_PDF_CONFIG,
  SEVERITY_ORDER,
} from "./pdf-styles";
import type { VulnerabilityItem } from "../security-report";

const styles = StyleSheet.create({
  severityBarContainer: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: COLORS.mutedLight,
    marginBottom: 10,
  },
  severityBarSegment: {
    height: "100%",
  },
  severityCountsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
  },
  severityCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  vulnerabilityCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
    borderRadius: 6,
    padding: 14,
    marginBottom: 10,
  },
  vulnerabilityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  vulnerabilityTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  findingId: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontFamily: "Courier",
  },
  vulnerabilityUrl: {
    fontSize: 8,
    color: COLORS.textSecondary,
    fontFamily: "Courier",
    marginBottom: 6,
  },
  sectionLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
    marginTop: 8,
  },
  evidenceBox: {
    backgroundColor: "#0f0f0f",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 8,
    marginTop: 4,
  },
  remediationBox: {
    backgroundColor: COLORS.emeraldLight,
    borderWidth: 1,
    borderColor: "#065f46",
    borderRadius: 4,
    padding: 8,
    marginTop: 4,
  },
  noVulnsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: COLORS.emeraldLight,
    borderWidth: 1,
    borderColor: "#065f46",
    borderRadius: 8,
  },
  noVulnsText: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.emerald,
    marginTop: 8,
  },
  noVulnsSubtext: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  scannedUrlsContainer: {
    marginTop: 16,
  },
  scannedUrl: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontFamily: "Courier",
    marginBottom: 2,
  },
  disclaimer: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  disclaimerText: {
    fontSize: 8,
    color: COLORS.textMuted,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  summaryIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.redLight,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCount: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  summaryLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
});

interface PdfSecurityReportProps {
  scan: {
    id: string;
    url: string;
    status: string;
    scanType: string;
    createdAt: string;
    result?: string | null;
    project?: {
      name: string;
    } | null;
  };
  vulnerabilities: VulnerabilityItem[];
}

export function PdfSecurityReport({
  scan,
  vulnerabilities,
}: PdfSecurityReportProps) {
  const total = vulnerabilities.length;
  const counts = SEVERITY_ORDER.reduce(
    (acc, sev) => {
      acc[sev] = vulnerabilities.filter((v) => v.severity === sev).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  const nonZeroSeverities = SEVERITY_ORDER.filter((sev) => counts[sev] > 0);

  let scannedUrls: string[] = [];
  try {
    const parsed = JSON.parse(scan.result ?? "{}");
    if (Array.isArray(parsed.scanned_urls)) {
      scannedUrls = parsed.scanned_urls;
    }
  } catch {
    // ignore
  }

  return (
    <PdfDocument scan={scan} reportTitle="Security Scan Report">
      <View>
        <Text style={globalStyles.sectionTitle}>Security Summary</Text>

        {total === 0 ? (
          <View style={styles.noVulnsContainer}>
            <Text style={styles.noVulnsText}>No vulnerabilities found</Text>
            <Text style={styles.noVulnsSubtext}>
              This scan completed without identifying any security issues.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.summaryRow}>
              <View style={styles.summaryIconCircle}>
                <Text
                  style={{
                    color: COLORS.red,
                    fontSize: 14,
                    fontWeight: "bold",
                  }}
                >
                  !
                </Text>
              </View>
              <View>
                <Text style={styles.summaryCount}>
                  {total} {total === 1 ? "Finding" : "Findings"}
                </Text>
                <Text style={styles.summaryLabel}>
                  Discovered during security scan
                </Text>
              </View>
            </View>

            {/* Severity distribution bar */}
            <View style={styles.severityBarContainer}>
              {nonZeroSeverities.map((sev) => (
                <View
                  key={sev}
                  style={[
                    styles.severityBarSegment,
                    {
                      width: `${(counts[sev] / total) * 100}%`,
                      backgroundColor: SEVERITY_PDF_CONFIG[sev].color,
                    },
                  ]}
                />
              ))}
            </View>

            {/* Severity counts */}
            <View style={styles.severityCountsRow}>
              {SEVERITY_ORDER.map((sev) => {
                const count = counts[sev];
                const cfg = SEVERITY_PDF_CONFIG[sev];
                return (
                  <View key={sev} style={styles.severityCountBadge}>
                    <View
                      style={[
                        styles.severityDot,
                        {
                          backgroundColor: count > 0 ? cfg.color : COLORS.muted,
                        },
                      ]}
                    />
                    <Text
                      style={{
                        fontSize: 9,
                        color: count > 0 ? cfg.color : COLORS.textMuted,
                        fontWeight: "bold",
                      }}
                    >
                      {count} {cfg.label}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View style={globalStyles.separator} />

            {/* Vulnerability List */}
            <Text style={globalStyles.sectionTitle}>Findings</Text>
            {[...vulnerabilities]
              .sort(
                (a, b) =>
                  SEVERITY_ORDER.indexOf(a.severity) -
                  SEVERITY_ORDER.indexOf(b.severity),
              )
              .map((vuln) => {
                const cfg = SEVERITY_PDF_CONFIG[vuln.severity];
                return (
                  <View
                    key={vuln.id}
                    style={[
                      styles.vulnerabilityCard,
                      { borderLeftColor: cfg.color },
                    ]}
                  >
                    <View style={styles.vulnerabilityHeader}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                          flex: 1,
                        }}
                      >
                        <Text
                          style={{
                            ...globalStyles.badge,
                            backgroundColor: cfg.bg,
                            color: cfg.color,
                          }}
                        >
                          {cfg.label}
                        </Text>
                        <Text style={styles.vulnerabilityTitle}>
                          {vuln.title}
                        </Text>
                      </View>
                      <Text style={styles.findingId}>{vuln.findingId}</Text>
                    </View>

                    {vuln.url && (
                      <Text style={styles.vulnerabilityUrl}>{vuln.url}</Text>
                    )}

                    <Text style={globalStyles.textSecondary}>
                      {vuln.description}
                    </Text>

                    <Text style={styles.sectionLabel}>Category</Text>
                    <Text
                      style={{
                        fontSize: 9,
                        color: COLORS.textSecondary,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {vuln.category}
                    </Text>

                    {vuln.evidence && (
                      <>
                        <Text style={styles.sectionLabel}>Evidence</Text>
                        <View style={styles.evidenceBox}>
                          <Text style={globalStyles.textMono}>
                            {vuln.evidence}
                          </Text>
                        </View>
                      </>
                    )}

                    {vuln.remediation && (
                      <>
                        <Text style={styles.sectionLabel}>Remediation</Text>
                        <View style={styles.remediationBox}>
                          <Text
                            style={{
                              fontSize: 9,
                              color: COLORS.textSecondary,
                              lineHeight: 1.4,
                            }}
                          >
                            {vuln.remediation}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                );
              })}
          </>
        )}

        {/* Scanned URLs */}
        {scannedUrls.length > 0 && (
          <View style={styles.scannedUrlsContainer}>
            <Text style={globalStyles.sectionTitle}>Scanned URLs</Text>
            {scannedUrls.map((url, i) => (
              <Text key={i} style={styles.scannedUrl}>
                • {url}
              </Text>
            ))}
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Security scan results are based on automated analysis and may not
            cover all potential vulnerabilities. Manual verification is
            recommended for critical findings.
          </Text>
        </View>
      </View>
    </PdfDocument>
  );
}
