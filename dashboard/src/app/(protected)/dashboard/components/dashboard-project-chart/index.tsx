import { Suspense } from "react";
import { cookies } from "next/headers";

import { DashboardProjectChartImpl } from "./dashboard-project-chart-impl";
import { DashboardProjectChartSkeleton } from "./dashboard-project-chart-skeleton";

export async function DashboardProjectChart() {
  const cookieHeader = (await cookies()).toString();
  return (
    <Suspense fallback={<DashboardProjectChartSkeleton />}>
      <DashboardProjectChartImpl cookieHeader={cookieHeader} />
    </Suspense>
  );
}
