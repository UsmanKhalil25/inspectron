"use client";

import { useSuspenseQuery } from "@apollo/client";
import {
  FolderKanban,
  ScanSearch,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

import { StatCard } from "@/app/(protected)/scans/components/scans-stats/stat-card";
import { SCAN_STATS } from "@/graphql/queries/scan-stats";
import { VULNERABILITY_STATS } from "@/graphql/queries/vulnerability-stats";
import { PROJECT_VULNERABILITY_STATS } from "@/graphql/queries/project-vulnerability-stats";
import { VulnerabilitySeverity } from "@/__generated__/graphql";

function DashboardStatsImpl({ cookieHeader }: { cookieHeader: string }) {
  const context = { headers: { cookie: cookieHeader } };

  const { data: scanStatsData } = useSuspenseQuery(SCAN_STATS, { context });
  const { data: vulnStatsData } = useSuspenseQuery(VULNERABILITY_STATS, {
    context,
  });
  const { data: projectVulnStatsData } = useSuspenseQuery(
    PROJECT_VULNERABILITY_STATS,
    { context },
  );

  const scanStats = scanStatsData?.scanStats;
  const vulnStats = vulnStatsData?.vulnerabilityStats;
  const projectCount =
    projectVulnStatsData?.projectVulnerabilityStats?.length ?? 0;

  const criticalCount =
    vulnStats?.bySeverity.find(
      (s) => s.severity === VulnerabilitySeverity.Critical,
    )?.count ?? 0;
  const highCount =
    vulnStats?.bySeverity.find((s) => s.severity === VulnerabilitySeverity.High)
      ?.count ?? 0;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Link href="/projects">
        <StatCard
          title="Projects"
          icon={FolderKanban}
          value={<div className="text-2xl font-bold">{projectCount}</div>}
        />
      </Link>

      <Link href="/scans">
        <StatCard
          title="Total Scans"
          icon={ScanSearch}
          value={
            <div className="text-2xl font-bold">
              {scanStats?.totalScans ?? 0}
            </div>
          }
        />
      </Link>

      <StatCard
        title="Vulnerabilities"
        icon={ShieldAlert}
        value={
          <div className="text-2xl font-bold">{vulnStats?.total ?? 0}</div>
        }
      />

      <StatCard
        title="Critical Issues"
        icon={AlertTriangle}
        value={
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-destructive">
              {criticalCount}
            </span>
            <span className="text-xs text-muted-foreground">
              {highCount} high
            </span>
          </div>
        }
      />
    </div>
  );
}

export { DashboardStatsImpl };
