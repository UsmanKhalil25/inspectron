"use client";

import { useSuspenseQuery } from "@apollo/client";

import { FolderKanban, ShieldAlert, Play, CheckCircle } from "lucide-react";

import { StatCard } from "@/app/(protected)/scans/components/scans-stats/stat-card";
import { PROJECTS } from "@/graphql/queries/projects";
import { SCAN_STATS } from "@/graphql/queries/scan-stats";
import { VULNERABILITY_STATS } from "@/graphql/queries/vulnerability-stats";

function ProjectsStatsImpl({ cookieHeader }: { cookieHeader: string }) {
  const context = { headers: { cookie: cookieHeader } };

  const { data: projectsData } = useSuspenseQuery(PROJECTS, {
    variables: { limit: 1, page: 1 },
    context,
  });

  const { data: scanStatsData } = useSuspenseQuery(SCAN_STATS, { context });

  const { data: vulnStatsData } = useSuspenseQuery(VULNERABILITY_STATS, {
    context,
  });

  const totalProjects = projectsData?.projects?.pagination?.total ?? 0;
  const scanStats = scanStatsData?.scanStats;
  const vulnStats = vulnStatsData?.vulnerabilityStats;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Projects"
        icon={FolderKanban}
        value={<div className="text-2xl font-bold">{totalProjects}</div>}
      />

      <StatCard
        title="Active Scans"
        icon={Play}
        value={
          <div className="text-2xl font-bold text-yellow-600">
            {scanStats?.scansByStatus.active ?? 0}
          </div>
        }
      />

      <StatCard
        title="Completed Scans"
        icon={CheckCircle}
        value={
          <div className="text-2xl font-bold text-green-600">
            {scanStats?.scansByStatus.completed ?? 0}
          </div>
        }
      />

      <StatCard
        title="Vulnerabilities"
        icon={ShieldAlert}
        value={
          <div className="text-2xl font-bold">{vulnStats?.total ?? 0}</div>
        }
      />
    </div>
  );
}

export { ProjectsStatsImpl };
