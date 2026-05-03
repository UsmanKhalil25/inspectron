import { Suspense } from "react";
import { cookies } from "next/headers";

import { DashboardStatsImpl } from "./dashboard-stats-impl";
import { DashboardStatsSkeleton } from "./dashboard-stats-skeleton";

export async function DashboardStats() {
  const cookieHeader = (await cookies()).toString();
  return (
    <Suspense fallback={<DashboardStatsSkeleton />}>
      <DashboardStatsImpl cookieHeader={cookieHeader} />
    </Suspense>
  );
}
