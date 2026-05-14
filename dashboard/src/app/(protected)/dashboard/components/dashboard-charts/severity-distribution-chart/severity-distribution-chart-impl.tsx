"use client";

import { useSuspenseQuery } from "@apollo/client";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Shield } from "lucide-react";

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

import { VULNERABILITY_STATS } from "@/graphql/queries/vulnerability-stats";

const chartConfig = {
  count: {
    label: "Vulnerabilities",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"] as const;

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-12 h-12 mb-4 rounded-full bg-muted flex items-center justify-center">
        <Shield className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold mb-1">No data yet</h3>
      <p className="text-muted-foreground text-center text-xs max-w-sm">
        Run scans to see severity distribution.
      </p>
    </div>
  );
}

function SeverityDistributionChartImpl({
  cookieHeader,
}: {
  cookieHeader: string;
}) {
  const { data } = useSuspenseQuery(VULNERABILITY_STATS, {
    context: { headers: { cookie: cookieHeader } },
  });

  const rawData = data?.vulnerabilityStats?.bySeverity ?? [];

  const SEVERITY_COLORS: Record<string, string> = {
    CRITICAL: "var(--chart-5)",
    HIGH: "var(--chart-4)",
    MEDIUM: "var(--chart-3)",
    LOW: "var(--chart-2)",
    INFO: "var(--chart-1)",
  };

  const chartData = SEVERITY_ORDER.map((severity) => {
    const item = rawData.find((d) => d.severity === severity);
    return {
      severity: severity.charAt(0) + severity.slice(1).toLowerCase(),
      count: item?.count ?? 0,
      fill: SEVERITY_COLORS[severity],
    };
  });

  const hasData = chartData.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <Card className="rounded-2xl shadow-sm border h-full">
        <CardHeader className="pb-2 px-5 pt-5">
          <CardTitle className="text-base font-semibold tracking-tight">
            Severity Distribution
          </CardTitle>
          <CardDescription className="text-sm">
            Vulnerabilities by severity level
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
      <CardHeader className="pb-2 px-5 pt-5">
        <CardTitle className="text-base font-semibold tracking-tight">
          Severity Distribution
        </CardTitle>
        <CardDescription className="text-sm">
          Vulnerabilities by severity level
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 px-2 pt-4 pb-2 sm:px-4 sm:pb-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
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
              dataKey="severity"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
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
            <Bar dataKey="count" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export { SeverityDistributionChartImpl };
