import { Suspense } from "react";
import { cookies } from "next/headers";

import { CategoryDistributionChartImpl } from "./category-distribution-chart-impl";
import { CategoryDistributionChartSkeleton } from "./category-distribution-chart-skeleton";

export async function CategoryDistributionChart() {
  const cookieHeader = (await cookies()).toString();
  return (
    <Suspense fallback={<CategoryDistributionChartSkeleton />}>
      <CategoryDistributionChartImpl cookieHeader={cookieHeader} />
    </Suspense>
  );
}
