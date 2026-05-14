"use client";

import * as React from "react";
import { useSuspenseQuery } from "@apollo/client";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { PROJECT_VULNERABILITY_STATS } from "@/graphql/queries/project-vulnerability-stats";

const chartConfig = {
  critical: {
    label: "Critical",
    color: "var(--chart-5)",
  },
  high: {
    label: "High",
    color: "var(--chart-4)",
  },
  medium: {
    label: "Medium",
    color: "var(--chart-3)",
  },
  low: {
    label: "Low",
    color: "var(--chart-2)",
  },
  info: {
    label: "Info",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type SeverityKey = keyof typeof chartConfig;

type ChartDataItem = {
  project: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  total: number;
};

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 mb-6 rounded-full bg-muted flex items-center justify-center">
        <FolderKanban className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No vulnerability data yet</h3>
      <p className="text-muted-foreground text-center mb-6 max-w-sm">
        Run some scans on your projects to see vulnerability breakdowns here.
      </p>
    </div>
  );
}

function ProjectVulnerabilitiesBarChartImpl({
  cookieHeader,
}: {
  cookieHeader: string;
}) {
  const { data } = useSuspenseQuery(PROJECT_VULNERABILITY_STATS, {
    context: { headers: { cookie: cookieHeader } },
  });

  const chartData: ChartDataItem[] = React.useMemo(() => {
    const stats = data?.projectVulnerabilityStats ?? [];
    return stats
      .slice()
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map((item) => ({
        project: item.projectName,
        critical: item.critical,
        high: item.high,
        medium: item.medium,
        low: item.low,
        info: item.info,
        total: item.total,
      }));
  }, [data?.projectVulnerabilityStats]);

  const hasAnyVulnerabilities = React.useMemo(
    () => chartData.some((item) => item.total > 0),
    [chartData],
  );

  const totals = React.useMemo(() => {
    const keys = Object.keys(chartConfig) as SeverityKey[];
    return keys.reduce(
      (acc, key) => {
        acc[key] = chartData.reduce((sum, curr) => sum + curr[key], 0);
        return acc;
      },
      {} as Record<SeverityKey, number>,
    );
  }, [chartData]);

  const grandTotal = React.useMemo(
    () => chartData.reduce((sum, curr) => sum + curr.total, 0),
    [chartData],
  );

  if (chartData.length === 0 || !hasAnyVulnerabilities) {
    return (
      <Card className="rounded-2xl shadow-sm border">
        <CardHeader className="pb-2 px-5 pt-5">
          <CardTitle className="text-base font-semibold tracking-tight">
            Top Vulnerable Projects
          </CardTitle>
          <CardDescription className="text-sm">
            Vulnerability breakdown across your most affected projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm border overflow-hidden">
      <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row bg-card">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-5 pb-4 sm:py-5">
          <CardTitle className="text-base font-semibold tracking-tight">
            Top Vulnerable Projects
          </CardTitle>
          <CardDescription className="text-sm">
            Vulnerability breakdown across your most affected projects
          </CardDescription>
        </div>
        <div className="flex border-t sm:border-t-0 sm:border-l divide-x overflow-x-auto">
          {(Object.keys(chartConfig) as SeverityKey[]).map((key) => (
            <div
              key={key}
              className="relative z-30 flex flex-1 flex-col justify-center gap-1 px-4 py-4 text-left min-w-[72px]"
            >
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {chartConfig[key].label}
              </span>
              <span className="text-lg leading-none font-bold tabular-nums sm:text-xl">
                {totals[key].toLocaleString()}
              </span>
            </div>
          ))}
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 px-4 py-4 text-left min-w-[72px] bg-muted/20">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total
            </span>
            <span className="text-lg leading-none font-bold tabular-nums sm:text-xl">
              {grandTotal.toLocaleString()}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-6 pb-2 sm:px-6 sm:pb-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 4,
              right: 4,
              top: 8,
              bottom: 4,
            }}
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="project"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={16}
              stroke="var(--muted-foreground)"
              fontSize={11}
              angle={-30}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              stroke="var(--muted-foreground)"
              tickFormatter={(value) =>
                typeof value === "number" ? value.toLocaleString() : value
              }
            />
            <ChartTooltip
              content={<ChartTooltipContent hideLabel indicator="line" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            {(Object.keys(chartConfig) as SeverityKey[]).map((key) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="a"
                fill={`var(--color-${key})`}
                radius={key === "info" ? [8, 8, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export { ProjectVulnerabilitiesBarChartImpl };
