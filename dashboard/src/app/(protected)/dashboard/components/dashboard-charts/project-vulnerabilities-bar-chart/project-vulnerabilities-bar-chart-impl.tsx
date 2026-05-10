"use client";

import * as React from "react";
import { useSuspenseQuery } from "@apollo/client";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
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
  type ChartConfig,
} from "@/components/ui/chart";

import { PROJECT_VULNERABILITY_STATS } from "@/graphql/queries/project-vulnerability-stats";

const chartConfig = {
  critical: {
    label: "Critical",
    color: "var(--destructive)",
  },
  high: {
    label: "High",
    color: "var(--chart-1)",
  },
  medium: {
    label: "Medium",
    color: "var(--chart-2)",
  },
  low: {
    label: "Low",
    color: "var(--chart-3)",
  },
  info: {
    label: "Info",
    color: "var(--chart-4)",
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
      .slice(0, 20)
      .map((item) => ({
        project: item.projectName,
        critical: item.critical,
        high: item.high,
        medium: item.medium,
        low: item.low,
        info: item.info,
      }));
  }, [data?.projectVulnerabilityStats]);

  const hasAnyVulnerabilities = React.useMemo(
    () =>
      chartData.some(
        (item) =>
          item.critical + item.high + item.medium + item.low + item.info > 0,
      ),
    [chartData],
  );

  const [activeChart, setActiveChart] = React.useState<SeverityKey>("critical");

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

  if (chartData.length === 0 || !hasAnyVulnerabilities) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            Vulnerabilities by Project
          </CardTitle>
          <CardDescription>
            Toggle severity levels to compare across projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm py-0">
      <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-4">
          <CardTitle className="text-base font-medium">
            Vulnerabilities by Project
          </CardTitle>
          <CardDescription>
            Toggle severity levels to compare across projects
          </CardDescription>
        </div>
        <div className="flex">
          {(Object.keys(chartConfig) as SeverityKey[]).map((key) => (
            <button
              key={key}
              data-active={activeChart === key}
              className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-4 py-3 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-t-0 sm:border-l sm:px-6 sm:py-4"
              onClick={() => setActiveChart(key)}
            >
              <span className="text-xs text-muted-foreground">
                {chartConfig[key].label}
              </span>
              <span className="text-lg leading-none font-bold sm:text-2xl">
                {totals[key].toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="project"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Bar
              dataKey={activeChart}
              fill={`var(--color-${activeChart})`}
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export { ProjectVulnerabilitiesBarChartImpl };
