import { Suspense } from "react";
import { cookies } from "next/headers";

import { DashboardRecentScansImpl } from "./dashboard-recent-scans-impl";
import { DashboardRecentScansSkeleton } from "./dashboard-recent-scans-skeleton";

export async function DashboardRecentScans() {
  const cookieHeader = (await cookies()).toString();
  return (
    <Suspense fallback={<DashboardRecentScansSkeleton />}>
      <DashboardRecentScansImpl cookieHeader={cookieHeader} />
    </Suspense>
  );
}
