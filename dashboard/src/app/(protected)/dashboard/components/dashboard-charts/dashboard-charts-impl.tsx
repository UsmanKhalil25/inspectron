"use client";

import { useSuspenseQuery } from "@apollo/client";
import { useMemo } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { ShieldAlert, ScanSearch } from "lucide-react";

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

import { SCAN_STATS } from "@/graphql/queries/scan-stats";
import { VULNERABILITY_STATS } from "@/graphql/queries/vulnerability-stats";
import { capitalize } from "@/common/utils/string.utils";

const SEVERITY_CHART_CONFIG: ChartConfig = {
  critical: { label: "Critical", color: "hsl(270, 80%, 35%)" },
  high: { label: "High", color: "hsl(270, 60%, 50%)" },
  medium: { label: "Medium", color: "hsl(270, 50%, 65%)" },
  low: { label: "Low", color: "hsl(270, 40%, 75%)" },
  info: { label: "Info", color: "hsl(270, 30%, 90%)" },
};

const STATUS_CHART_CONFIG: ChartConfig = {
  draft: { label: "Draft", color: "hsl(215, 20%, 65%)" },
  queued: { label: "Queued", color: "hsl(215, 70%, 60%)" },
  active: { label: "Active", color: "hsl(45, 90%, 55%)" },
  completed: { label: "Completed", color: "hsl(145, 60%, 40%)" },
  failed: { label: "Failed", color: "hsl(0, 80%, 55%)" },
};

function DashboardChartsImpl({ cookieHeader }: { cookieHeader: string }) {
  const context = { headers: { cookie: cookieHeader } };

  const { data: scanStatsData } = useSuspenseQuery(SCAN_STATS, { context });
  const { data: vulnStatsData } = useSuspenseQuery(VULNERABILITY_STATS, {
    context,
  });

  const scanStats = scanStatsData?.scanStats;
  const vulnStats = vulnStatsData?.vulnerabilityStats;

  const severityPieData = useMemo(() => {
    if (!vulnStats) return [];
    return vulnStats.bySeverity
      .filter((s) => s.count > 0)
      .map((s) => ({
        name: capitalize(s.severity),
        value: s.count,
        severity: s.severity,
        fill: `var(--color-${s.severity})`,
      }));
  }, [vulnStats]);

  const hasSeverityData = vulnStats ? vulnStats.total > 0 : false;

  const statusPieData = useMemo(() => {
    if (!scanStats) return [];
    const statusMap: Record<string, number> = {
      draft: scanStats.scansByStatus.draft,
      queued: scanStats.scansByStatus.queued,
      active: scanStats.scansByStatus.active,
      completed: scanStats.scansByStatus.completed,
      failed: scanStats.scansByStatus.failed,
    };
    return Object.entries(statusMap)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({
        name: capitalize(key),
        value,
        status: key,
        fill: `var(--color-${key})`,
      }));
  }, [scanStats]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Vulnerability Severity</CardTitle>
          <CardDescription>Distribution by severity level</CardDescription>
        </CardHeader>
        <CardContent>
          {hasSeverityData ? (
            <ChartContainer
              config={SEVERITY_CHART_CONFIG}
              className="mx-auto aspect-square h-[250px]"
            >
              <PieChart>
                <Pie
                  data={severityPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {severityPieData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 mb-6 rounded-full bg-muted flex items-center justify-center">
                <ShieldAlert className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                No vulnerability data yet
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm">
                Vulnerability data will appear once you have completed scans.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Scans by Status</CardTitle>
          <CardDescription>Current scan status distribution</CardDescription>
        </CardHeader>
        <CardContent>
          {statusPieData.length > 0 ? (
            <ChartContainer
              config={STATUS_CHART_CONFIG}
              className="mx-auto aspect-square h-[250px]"
            >
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 mb-6 rounded-full bg-muted flex items-center justify-center">
                <ScanSearch className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No scan data yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm">
                Scan data will appear once you create your first scan.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export { DashboardChartsImpl };
