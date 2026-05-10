"use client";

import * as React from "react";
import { useSuspenseQuery } from "@apollo/client";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

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

function ScanTrendLineChartImpl({ cookieHeader }: { cookieHeader: string }) {
  const { data } = useSuspenseQuery(SCAN_TREND_STATS, {
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

  const [activeChart, setActiveChart] = React.useState<TrendKey>("scans");

  return (
    <Card className="rounded-2xl shadow-sm py-0">
      <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-4">
          <CardTitle className="text-base font-medium">Scan Trends</CardTitle>
          <CardDescription>
            Scans and vulnerabilities over the last 30 days
          </CardDescription>
        </div>
        <div className="flex">
          {(Object.keys(chartConfig) as TrendKey[]).map((key) => (
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
                {total[key].toLocaleString()}
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
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke={`var(--color-${activeChart})`}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export { ScanTrendLineChartImpl };
