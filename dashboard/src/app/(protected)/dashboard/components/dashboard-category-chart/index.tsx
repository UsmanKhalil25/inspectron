import { Suspense } from "react";
import { cookies } from "next/headers";

import { DashboardCategoryChartImpl } from "./dashboard-category-chart-impl";
import { DashboardCategoryChartSkeleton } from "./dashboard-category-chart-skeleton";

export async function DashboardCategoryChart() {
  const cookieHeader = (await cookies()).toString();
  return (
    <Suspense fallback={<DashboardCategoryChartSkeleton />}>
      <DashboardCategoryChartImpl cookieHeader={cookieHeader} />
    </Suspense>
  );
}
