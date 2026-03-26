"use client";

import { useSuspenseQuery, useSubscription, useMutation } from "@apollo/client";
import { useMemo } from "react";
import { AlertTriangle, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ScanDetailHeader } from "./scan-detail-header";
import { BrowserPreview } from "../browser-preview";
import { AgentActivity } from "../agent-activity";

import { SCAN } from "@/graphql/queries/scan";
import { SCAN_STATUS_CHANGED } from "@/graphql/subscriptions/scan-status";
import { START_SCAN } from "@/graphql/mutations/start-scan";
import { Button } from "@/components/ui/button";
import type { GetScanQuery } from "@/__generated__/graphql";

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

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background">
      <ScanDetailHeader url={scan.url} status={scan.status} scanId={scan.id} />
      <div className="flex flex-1 overflow-hidden">
        {isDraft ? (
          <DraftState scan={scan} />
        ) : isTerminal ? (
          <AgentActivity scan={scan} fullWidth />
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
