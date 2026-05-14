import { Suspense } from "react";
import { cookies } from "next/headers";

import { SeverityDistributionChartImpl } from "./severity-distribution-chart-impl";
import { SeverityDistributionChartSkeleton } from "./severity-distribution-chart-skeleton";

export async function SeverityDistributionChart() {
  const cookieHeader = (await cookies()).toString();
  return (
    <Suspense fallback={<SeverityDistributionChartSkeleton />}>
      <SeverityDistributionChartImpl cookieHeader={cookieHeader} />
    </Suspense>
  );
}
