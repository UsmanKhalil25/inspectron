import { Suspense } from "react";
import { cookies } from "next/headers";

import { ScanTrendBarChartImpl } from "./scan-trend-bar-chart-impl";
import { ScanTrendBarChartSkeleton } from "./scan-trend-bar-chart-skeleton";

export async function ScanTrendBarChart() {
  const cookieHeader = (await cookies()).toString();
  return (
    <Suspense fallback={<ScanTrendBarChartSkeleton />}>
      <ScanTrendBarChartImpl cookieHeader={cookieHeader} />
    </Suspense>
  );
}
