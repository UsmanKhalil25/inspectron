"use client";

import * as React from "react";
import { useSuspenseQuery } from "@apollo/client";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";

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

import { SCAN_TREND_STATS } from "@/graphql/queries/scan-trend-stats";
import { SCAN_STATS } from "@/graphql/queries/scan-stats";

const chartConfig = {
  scans: {
    label: "Scans",
    color: "var(--chart-1)",
  },
  vulnerabilities: {
    label: "Vulnerabilities",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

type TrendKey = keyof typeof chartConfig;

function EmptyState({ totalScans }: { totalScans: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 mb-6 rounded-full bg-muted flex items-center justify-center">
        <TrendingUp className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        No scanning activity in the last 30 days
      </h3>
      <p className="text-muted-foreground text-center mb-6 max-w-sm">
        {totalScans > 0
          ? `You have ${totalScans} scan${totalScans === 1 ? "" : "s"} outside this window. Run more scans to see daily trends.`
          : "Run some scans to see trends over time."}
      </p>
    </div>
  );
}

function ScanTrendBarChartImpl({ cookieHeader }: { cookieHeader: string }) {
  const { data } = useSuspenseQuery(SCAN_TREND_STATS, {
    context: { headers: { cookie: cookieHeader } },
    variables: { days: 30 },
  });

  const { data: scanStatsData } = useSuspenseQuery(SCAN_STATS, {
    context: { headers: { cookie: cookieHeader } },
  });

  const chartData = React.useMemo(
    () => data?.scanTrendStats ?? [],
    [data?.scanTrendStats],
  );

  const total = React.useMemo(
    () => ({
      scans: chartData.reduce((acc, curr) => acc + curr.scans, 0),
      vulnerabilities: chartData.reduce(
        (acc, curr) => acc + curr.vulnerabilities,
        0,
      ),
    }),
    [chartData],
  );

  const totalScans = scanStatsData?.scanStats?.totalScans ?? 0;

  const [activeChart, setActiveChart] = React.useState<TrendKey>("scans");

  const hasAnyActivity = total.scans > 0 || total.vulnerabilities > 0;

  if (!hasAnyActivity) {
    return (
      <Card className="rounded-2xl shadow-sm border">
        <CardHeader className="pb-2 px-5 pt-5">
          <CardTitle className="text-base font-semibold tracking-tight">
            Scan Trends
          </CardTitle>
          <CardDescription className="text-sm">
            Scans and vulnerabilities over the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState totalScans={totalScans} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm border overflow-hidden">
      <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row bg-card">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-5 pb-4 sm:py-5">
          <CardTitle className="text-base font-semibold tracking-tight">
            Scan Trends
          </CardTitle>
          <CardDescription className="text-sm">
            Scans and vulnerabilities over the last 30 days
          </CardDescription>
        </div>
        <div className="flex border-t sm:border-t-0 sm:border-l divide-x">
          {(Object.keys(chartConfig) as TrendKey[]).map((key) => (
            <button
              key={key}
              data-active={activeChart === key}
              className="relative z-30 flex flex-1 flex-col justify-center gap-1 px-5 py-4 text-left transition-colors hover:bg-muted/30 data-[active=true]:bg-muted/50"
              onClick={() => setActiveChart(key)}
            >
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {chartConfig[key].label}
              </span>
              <span className="text-xl leading-none font-bold tabular-nums sm:text-2xl">
                {total[key].toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-6 pb-2 sm:px-6 sm:pb-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[280px] w-full"
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
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
              stroke="var(--muted-foreground)"
              fontSize={12}
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
            <Bar
              dataKey={activeChart}
              fill={`var(--color-${activeChart})`}
              radius={8}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export { ScanTrendBarChartImpl };
