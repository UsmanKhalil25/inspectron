"use client";

import { useSuspenseQuery, useSubscription } from "@apollo/client";
import { AlertTriangle } from "lucide-react";

import {ScanDetailHeader} from "../scan-detail-header";
import { BrowserPreview } from "../browser-preview";
import { AgentActivity } from "../agent-activity";

import { SCAN } from "@/graphql/queries/scan";
import { SCAN_STATUS_CHANGED } from "@/graphql/subscriptions/scan-status";

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

export function ScanDetailImpl({ scanId, cookieHeader }: ScanDetailImplProps) {
  const { data, error } = useSuspenseQuery(SCAN, {
    variables: { id: scanId },
    context: {
      headers: {
        cookie: cookieHeader,
      },
    },
  });

  useSubscription(SCAN_STATUS_CHANGED, {
    variables: { scanId },
    context: {
      headers: {
        cookie: cookieHeader,
      },
    },
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

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background">
      <ScanDetailHeader url={scan.url} status={scan.status} scanId={scan.id} />
      <div className="flex flex-1 overflow-hidden">
        <BrowserPreview scan={scan} />
        <AgentActivity scan={scan} />
      </div>
    </div>
  );
}
