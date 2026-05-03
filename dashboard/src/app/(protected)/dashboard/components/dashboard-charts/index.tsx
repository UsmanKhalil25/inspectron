import { Suspense } from "react";
import { cookies } from "next/headers";

import { DashboardChartsImpl } from "./dashboard-charts-impl";
import { DashboardChartsSkeleton } from "./dashboard-charts-skeleton";

export async function DashboardCharts() {
  const cookieHeader = (await cookies()).toString();
  return (
    <Suspense fallback={<DashboardChartsSkeleton />}>
      <DashboardChartsImpl cookieHeader={cookieHeader} />
    </Suspense>
  );
}
