"use client";

import { useState, useCallback } from "react";
import { pdf } from "@react-pdf/renderer";
import { PdfSecurityReport } from "./pdf-security-report";
import { PdfPerformanceReport } from "./pdf-performance-report";
import type { VulnerabilityItem } from "../security-report";
import type { PerformanceMetricData } from "../performance-report";

export interface ExportPdfInput {
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
  performanceMetrics: PerformanceMetricData[];
}

export async function exportScanPdf(input: ExportPdfInput) {
  const { scan, vulnerabilities, performanceMetrics } = input;
  const isPerformance = scan.scanType.toUpperCase() === "PERFORMANCE";

  const doc = isPerformance
    ? PdfPerformanceReport({ scan, performanceMetrics })
    : PdfSecurityReport({ scan, vulnerabilities });

  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `inspectron-scan-${scan.id}-${isPerformance ? "performance" : "security"}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function useExportPdf() {
  const [loading, setLoading] = useState(false);

  const exportPdf = useCallback(async (input: ExportPdfInput) => {
    setLoading(true);
    try {
      await exportScanPdf(input);
    } finally {
      setLoading(false);
    }
  }, []);

  return { exportPdf, loading };
}
