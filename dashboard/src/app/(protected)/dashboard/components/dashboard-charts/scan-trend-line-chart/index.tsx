import { Suspense } from "react";
import { cookies } from "next/headers";

import { ScanTrendLineChartImpl } from "./scan-trend-line-chart-impl";
import { ScanTrendLineChartSkeleton } from "./scan-trend-line-chart-skeleton";

export async function ScanTrendLineChart() {
  const cookieHeader = (await cookies()).toString();
  return (
    <Suspense fallback={<ScanTrendLineChartSkeleton />}>
      <ScanTrendLineChartImpl cookieHeader={cookieHeader} />
    </Suspense>
  );
}
