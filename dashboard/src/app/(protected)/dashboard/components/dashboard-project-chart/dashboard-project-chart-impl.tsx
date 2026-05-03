"use client";

import { useSuspenseQuery } from "@apollo/client";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { FolderKanban } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { PROJECT_VULNERABILITY_STATS } from "@/graphql/queries/project-vulnerability-stats";

const SEVERITY_CHART_CONFIG: ChartConfig = {
  critical: { label: "Critical", color: "hsl(270, 80%, 35%)" },
  high: { label: "High", color: "hsl(270, 60%, 50%)" },
  medium: { label: "Medium", color: "hsl(270, 50%, 65%)" },
  low: { label: "Low", color: "hsl(270, 40%, 75%)" },
  info: { label: "Info", color: "hsl(270, 30%, 90%)" },
};

function DashboardProjectChartImpl({ cookieHeader }: { cookieHeader: string }) {
  const context = { headers: { cookie: cookieHeader } };

  const { data: projectVulnStatsData } = useSuspenseQuery(
    PROJECT_VULNERABILITY_STATS,
    { context },
  );

  const projectVulnStats = useMemo(
    () => projectVulnStatsData?.projectVulnerabilityStats ?? [],
    [projectVulnStatsData],
  );

  const projectBarData = useMemo(() => {
    return projectVulnStats
      .filter((p) => p.total > 0)
      .slice(0, 10)
      .map((p) => ({
        name:
          p.projectName.length > 15
            ? p.projectName.slice(0, 15) + "..."
            : p.projectName,
        critical: p.critical,
        high: p.high,
        medium: p.medium,
        low: p.low,
        info: p.info,
      }));
  }, [projectVulnStats]);

  if (projectBarData.length === 0) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">
            Vulnerabilities by Project
          </CardTitle>
          <CardDescription>
            Stacked severity breakdown per project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 mb-6 rounded-full bg-muted flex items-center justify-center">
              <FolderKanban className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No project data yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Project vulnerability data will appear once scans are completed.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Vulnerabilities by Project</CardTitle>
        <CardDescription>
          Stacked severity breakdown per project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={SEVERITY_CHART_CONFIG}
          className="h-[300px] w-full"
        >
          <BarChart data={projectBarData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="critical"
              stackId="severity"
              fill="var(--color-critical)"
              radius={[0, 0, 0, 0]}
            />
            <Bar dataKey="high" stackId="severity" fill="var(--color-high)" />
            <Bar
              dataKey="medium"
              stackId="severity"
              fill="var(--color-medium)"
            />
            <Bar dataKey="low" stackId="severity" fill="var(--color-low)" />
            <Bar
              dataKey="info"
              stackId="severity"
              fill="var(--color-info)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export { DashboardProjectChartImpl };
