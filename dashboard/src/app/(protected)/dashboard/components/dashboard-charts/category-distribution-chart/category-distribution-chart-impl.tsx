"use client";

import * as React from "react";
import { useSuspenseQuery } from "@apollo/client";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Tag } from "lucide-react";

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
  type ChartConfig,
} from "@/components/ui/chart";

import { VULNERABILITY_STATS } from "@/graphql/queries/vulnerability-stats";

const chartConfig = {
  count: {
    label: "Vulnerabilities",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function formatCategoryLabel(category: string): string {
  const label = category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return label;
}

function truncateLabel(label: string, maxLength: number = 12): string {
  if (label.length <= maxLength) return label;
  return label.slice(0, maxLength - 3) + "...";
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-12 h-12 mb-4 rounded-full bg-muted flex items-center justify-center">
        <Tag className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold mb-1">No data yet</h3>
      <p className="text-muted-foreground text-center text-xs max-w-sm">
        Run scans to see vulnerability categories.
      </p>
    </div>
  );
}

const CATEGORY_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function CategoryDistributionChartImpl({
  cookieHeader,
}: {
  cookieHeader: string;
}) {
  const { data } = useSuspenseQuery(VULNERABILITY_STATS, {
    context: { headers: { cookie: cookieHeader } },
  });

  const chartData = React.useMemo(() => {
    const rawData = data?.vulnerabilityStats?.byCategory ?? [];
    return rawData
      .map((item, index) => ({
        category: formatCategoryLabel(item.category),
        categoryShort: truncateLabel(formatCategoryLabel(item.category)),
        count: item.count,
        fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.count - a.count);
  }, [data?.vulnerabilityStats?.byCategory]);

  const hasData = chartData.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <Card className="rounded-2xl shadow-sm border h-full">
        <CardHeader className="pb-2 px-5 pt-5">
          <CardTitle className="text-base font-semibold tracking-tight">
            Categories
          </CardTitle>
          <CardDescription className="text-sm">
            Vulnerabilities by type
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
          Categories
        </CardTitle>
        <CardDescription className="text-sm">
          Vulnerabilities by type
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
            layout="vertical"
            margin={{
              left: 8,
              right: 8,
              top: 8,
              bottom: 4,
            }}
          >
            <CartesianGrid
              horizontal={false}
              stroke="var(--border)"
              strokeOpacity={0.5}
            />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              stroke="var(--muted-foreground)"
              tickFormatter={(value) =>
                typeof value === "number" ? value.toLocaleString() : value
              }
            />
            <YAxis
              dataKey="categoryShort"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={120}
              fontSize={11}
              stroke="var(--muted-foreground)"
              textAnchor="end"
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.3 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0]?.payload as
                  | {
                      category: string;
                      count: number;
                    }
                  | undefined;
                if (!item) return null;
                return (
                  <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
                    <p className="text-xs font-medium text-foreground mb-1">
                      {item.category}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: "var(--color-count)" }}
                      />
                      <span className="font-medium text-foreground">
                        Vulnerabilities:
                      </span>
                      <span className="text-muted-foreground">
                        {item.count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export { CategoryDistributionChartImpl };
