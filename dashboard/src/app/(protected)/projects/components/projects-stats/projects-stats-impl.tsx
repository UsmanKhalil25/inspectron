"use client";

import { useSuspenseQuery } from "@apollo/client";
import { FolderKanban, ShieldAlert, Play, CheckCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const stats = [
    {
      title: "Total Projects",
      icon: FolderKanban,
      value: totalProjects,
      description: "All projects",
    },
    {
      title: "Active Scans",
      icon: Play,
      value: scanStats?.scansByStatus.active ?? 0,
      description: "Currently running",
    },
    {
      title: "Completed Scans",
      icon: CheckCircle,
      value: scanStats?.scansByStatus.completed ?? 0,
      description: "Finished scans",
    },
    {
      title: "Vulnerabilities",
      icon: ShieldAlert,
      value: vulnStats?.total ?? 0,
      description: "Total found",
    },
  ];

  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="rounded-2xl shadow-sm border h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-5 pt-5">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <span className="text-2xl font-bold tracking-tight tabular-nums">
              {stat.value.toLocaleString()}
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export { ProjectsStatsImpl };
