"use client";

import { useSuspenseQuery } from "@apollo/client";
import { useMemo } from "react";
import { ShieldAlert } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

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
import { VulnerabilityCategory } from "@/__generated__/graphql";
import { capitalize } from "@/common/utils/string.utils";

const CATEGORY_LABELS: Record<string, string> = {
  [VulnerabilityCategory.SecurityHeaders]: "Security Headers",
  [VulnerabilityCategory.SensitiveFiles]: "Sensitive Files",
  [VulnerabilityCategory.Cookies]: "Cookies",
  [VulnerabilityCategory.Csrf]: "CSRF",
  [VulnerabilityCategory.InformationDisclosure]: "Info Disclosure",
  [VulnerabilityCategory.Xss]: "XSS",
  [VulnerabilityCategory.SqlInjection]: "SQL Injection",
};

const CATEGORY_CHART_CONFIG: ChartConfig = {
  count: { label: "Vulnerabilities", color: "hsl(270, 60%, 50%)" },
};

function DashboardCategoryChartImpl({
  cookieHeader,
}: {
  cookieHeader: string;
}) {
  const context = { headers: { cookie: cookieHeader } };

  const { data: vulnStatsData } = useSuspenseQuery(VULNERABILITY_STATS, {
    context,
  });

  const vulnStats = vulnStatsData?.vulnerabilityStats;

  const categoryBarData = useMemo(() => {
    if (!vulnStats) return [];
    return vulnStats.byCategory
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .map((c) => ({
        category: CATEGORY_LABELS[c.category] || capitalize(c.category),
        count: c.count,
        fill: "var(--color-count)",
      }));
  }, [vulnStats]);

  if (categoryBarData.length === 0) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">
            Vulnerabilities by Category
          </CardTitle>
          <CardDescription>
            Breakdown across vulnerability categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 mb-6 rounded-full bg-muted flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No category data yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Category breakdown will appear once vulnerabilities are found.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Vulnerabilities by Category</CardTitle>
        <CardDescription>
          Breakdown across vulnerability categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={CATEGORY_CHART_CONFIG}
          className="h-[300px] w-full"
        >
          <BarChart
            data={categoryBarData}
            layout="vertical"
            margin={{ left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis type="category" dataKey="category" width={120} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export { DashboardCategoryChartImpl };
