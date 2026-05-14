import { Suspense } from "react";
import { cookies } from "next/headers";

import { ScanStatusDonutChartImpl } from "./scan-status-donut-chart-impl";
import { ScanStatusDonutChartSkeleton } from "./scan-status-donut-chart-skeleton";

export async function ScanStatusDonutChart() {
  const cookieHeader = (await cookies()).toString();
  return (
    <Suspense fallback={<ScanStatusDonutChartSkeleton />}>
      <ScanStatusDonutChartImpl cookieHeader={cookieHeader} />
    </Suspense>
  );
}
