"use client";

import { useSuspenseQuery, useSubscription, useMutation } from "@apollo/client";
import { useMemo } from "react";
import {
  AlertTriangle,
  Shield,
  Gauge,
  Loader2,
  FileText,
  Activity,
  FileDown,
} from "lucide-react";
import { toast } from "sonner";

import { ScanDetailHeader } from "./scan-detail-header";
import { BrowserPreview } from "../browser-preview";
import { AgentActivity } from "../agent-activity";
import { PerformanceReport } from "../performance-report";
import { SecurityReport } from "../security-report";
import type { VulnerabilityItem } from "../security-report";

import { SCAN } from "@/graphql/queries/scan";
import { SCAN_STATUS_CHANGED } from "@/graphql/subscriptions/scan-status";
import { START_SCAN } from "@/graphql/mutations/start-scan";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { GetScanQuery } from "@/__generated__/graphql";
import { useExportPdf } from "../pdf-report";

interface ScanDetailImplProps {
  scanId: string;
  cookieHeader: string;
}

function ErrorState({
  title = "Failed to load scan",
  description = "We're having trouble connecting to our servers. Please check your connection and try again.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background px-4">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-6 max-w-sm text-center text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function DraftState({ scan }: { scan: NonNullable<GetScanQuery["scan"]> }) {
  const [startScan, { loading }] = useMutation(START_SCAN, {
    variables: { id: scan.id },
    onError: (err) => {
      toast.error(err.message ?? "Failed to start scan");
    },
  });

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-background px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800">
        <Shield className="h-8 w-8 text-zinc-400" />
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <h3 className="text-lg font-semibold">Ready to Scan</h3>
        <p className="text-sm text-muted-foreground">{scan.url}</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          This scan hasn&apos;t started yet. Queue it to begin.
        </p>
      </div>
      <Button onClick={() => startScan()} disabled={loading} className="gap-2">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Start Scan
      </Button>
    </div>
  );
}

function SecurityScanResults({
  scan,
}: {
  scan: NonNullable<GetScanQuery["scan"]>;
}) {
  return (
    <div className="flex-1 overflow-auto p-6">
      <Tabs defaultValue="results" className="w-full">
        <TabsList className="mb-6 bg-muted/50">
          <TabsTrigger value="results" className="gap-1.5 text-xs">
            <FileText className="h-3.5 w-3.5" />
            Results
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-1.5 text-xs">
            <Activity className="h-3.5 w-3.5" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="mt-0">
          <SecurityReport
            vulnerabilities={
              (scan.vulnerabilities as VulnerabilityItem[]) ?? []
            }
            result={scan.result}
          />
        </TabsContent>

        <TabsContent value="activity" className="mt-0">
          <AgentActivity scan={scan} fullWidth />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PerformanceRunningState({
  scan,
}: {
  scan: NonNullable<GetScanQuery["scan"]>;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-background px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-green-700 bg-green-950">
        <Gauge className="h-8 w-8 text-green-400" />
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <h3 className="text-lg font-semibold">Running Performance Audit</h3>
        <p className="text-sm text-muted-foreground">{scan.url}</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Lighthouse is analyzing page performance, Core Web Vitals, and
          resource loading. This may take 30–60 seconds.
        </p>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Analyzing...
      </div>
    </div>
  );
}

function ExportPdfButton({
  scan,
}: {
  scan: NonNullable<GetScanQuery["scan"]>;
}) {
  const { exportPdf, loading } = useExportPdf();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
      disabled={loading}
      onClick={() =>
        exportPdf({
          scan: {
            id: scan.id,
            url: scan.url,
            status: scan.status,
            scanType: scan.scanType,
            createdAt: scan.createdAt,
            result: scan.result,
            project: scan.project ? { name: scan.project.name } : null,
          },
          vulnerabilities: (scan.vulnerabilities ?? []) as VulnerabilityItem[],
          performanceMetrics: scan.performanceMetrics ?? [],
        })
      }
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <FileDown className="h-3.5 w-3.5" />
      )}
      Export PDF
    </Button>
  );
}

export function ScanDetailImpl({ scanId, cookieHeader }: ScanDetailImplProps) {
  const context = useMemo(
    () => ({ headers: { cookie: cookieHeader } }),
    [cookieHeader],
  );

  const { data, error } = useSuspenseQuery(SCAN, {
    variables: { id: scanId },
    context,
  });

  useSubscription(SCAN_STATUS_CHANGED, {
    variables: { scanId },
    context,
  });

  if (error) {
    return <ErrorState />;
  }

  const scan = data?.scan;

  if (!scan) {
    return (
      <ErrorState
        title="Scan not found"
        description="The scan you're looking for doesn't exist or you don't have access to it."
      />
    );
  }

  const status = scan.status.toUpperCase();
  const isTerminal = status === "COMPLETED" || status === "FAILED";
  const isDraft = status === "DRAFT";
  const isPerformance = scan.scanType === "PERFORMANCE";

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background">
      <ScanDetailHeader
        url={scan.url}
        status={scan.status}
        scanId={scan.id}
        project={scan.project}
        actions={isTerminal ? <ExportPdfButton scan={scan} /> : undefined}
      />
      <div className="flex flex-1 overflow-hidden">
        {isDraft ? (
          <DraftState scan={scan} />
        ) : isTerminal && isPerformance ? (
          <div className="flex-1 overflow-auto p-6">
            <PerformanceReport
              performanceMetrics={scan.performanceMetrics ?? []}
            />
          </div>
        ) : !isTerminal && isPerformance ? (
          <PerformanceRunningState scan={scan} />
        ) : isTerminal ? (
          <SecurityScanResults scan={scan} />
        ) : (
          <>
            <BrowserPreview scan={scan} />
            <AgentActivity scan={scan} />
          </>
        )}
      </div>
    </div>
  );
}
