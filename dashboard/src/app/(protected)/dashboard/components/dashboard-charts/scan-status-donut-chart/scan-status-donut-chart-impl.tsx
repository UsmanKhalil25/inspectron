"use client";

import * as React from "react";
import { useSuspenseQuery } from "@apollo/client";
import { Pie, PieChart } from "recharts";
import { Activity } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { SCAN_STATS } from "@/graphql/queries/scan-stats";

const chartConfig = {
  completed: {
    label: "Completed",
    color: "var(--chart-1)",
  },
  active: {
    label: "Active",
    color: "var(--chart-2)",
  },
  queued: {
    label: "Queued",
    color: "var(--chart-3)",
  },
  draft: {
    label: "Draft",
    color: "var(--chart-4)",
  },
  failed: {
    label: "Failed",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-12 h-12 mb-4 rounded-full bg-muted flex items-center justify-center">
        <Activity className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold mb-1">No scans yet</h3>
      <p className="text-muted-foreground text-center text-xs max-w-sm">
        Create and run scans to see status breakdown.
      </p>
    </div>
  );
}

function ScanStatusDonutChartImpl({ cookieHeader }: { cookieHeader: string }) {
  const { data } = useSuspenseQuery(SCAN_STATS, {
    context: { headers: { cookie: cookieHeader } },
  });

  const scansByStatus = data?.scanStats?.scansByStatus;

  const chartData: Array<{ status: string; count: number; fill: string }> =
    React.useMemo(() => {
      if (!scansByStatus) return [];
      return [
        {
          status: "draft",
          count: scansByStatus.draft,
          fill: "var(--color-draft)",
        },
        {
          status: "queued",
          count: scansByStatus.queued,
          fill: "var(--color-queued)",
        },
        {
          status: "active",
          count: scansByStatus.active,
          fill: "var(--color-active)",
        },
        {
          status: "completed",
          count: scansByStatus.completed,
          fill: "var(--color-completed)",
        },
        {
          status: "failed",
          count: scansByStatus.failed,
          fill: "var(--color-failed)",
        },
      ].filter((item) => item.count > 0);
    }, [scansByStatus]);

  const totalScans = data?.scanStats?.totalScans ?? 0;

  if (totalScans === 0) {
    return (
      <Card className="rounded-2xl shadow-sm border h-full">
        <CardHeader className="pb-2 px-5 pt-5 items-center">
          <CardTitle className="text-base font-semibold tracking-tight">
            Scan Status
          </CardTitle>
          <CardDescription className="text-sm">
            Distribution by status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm border h-full flex flex-col">
      <CardHeader className="pb-2 px-5 pt-5 items-center">
        <CardTitle className="text-base font-semibold tracking-tight">
          Scan Status
        </CardTitle>
        <CardDescription className="text-sm">
          Distribution by status
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 px-2 pt-4 pb-2 sm:px-4 sm:pb-4 flex flex-col justify-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[220px] w-full"
        >
          <PieChart accessibilityLayer>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="status"
                  hideLabel
                  indicator="line"
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              outerRadius={90}
              strokeWidth={2}
              stroke="var(--background)"
              paddingAngle={2}
            />
            <ChartLegend content={<ChartLegendContent nameKey="status" />} />
          </PieChart>
        </ChartContainer>
        {totalScans > 0 && (
          <div className="text-center mt-2">
            <span className="text-xs text-muted-foreground">
              Total: {totalScans.toLocaleString()} scans
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { ScanStatusDonutChartImpl };
