"use client";

import { useSuspenseQuery } from "@apollo/client";
import {
  FolderKanban,
  ScanSearch,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const stats = [
    {
      title: "Projects",
      icon: FolderKanban,
      value: projectCount,
      href: "/projects",
      description: "Total projects",
    },
    {
      title: "Total Scans",
      icon: ScanSearch,
      value: scanStats?.totalScans ?? 0,
      href: "/scans",
      description: "All-time scans",
    },
    {
      title: "Vulnerabilities",
      icon: ShieldAlert,
      value: vulnStats?.total ?? 0,
      description: "Total found",
    },
    {
      title: "Critical Issues",
      icon: AlertTriangle,
      value: criticalCount,
      subValue: highCount > 0 ? `${highCount} high` : undefined,
      description: "Need immediate attention",
    },
  ];

  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const card = (
          <Card className="rounded-2xl shadow-sm border hover:border-muted-foreground/20 transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-5 pt-5">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight tabular-nums">
                  {stat.value.toLocaleString()}
                </span>
                {stat.subValue && (
                  <span className="text-xs text-muted-foreground">
                    {stat.subValue}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );

        if (stat.href) {
          return (
            <Link key={stat.title} href={stat.href} className="block">
              {card}
            </Link>
          );
        }

        return <div key={stat.title}>{card}</div>;
      })}
    </div>
  );
}

export { DashboardStatsImpl };
