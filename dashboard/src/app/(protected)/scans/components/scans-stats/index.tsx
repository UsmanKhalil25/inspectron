import { Suspense } from "react";
import { cookies } from "next/headers";

import { ScansStatsImpl } from "./scans-stats-impl";
import { ScansStatsSkeleton } from "./scans-stats-skeleton";

export async function ScansStats() {
  const cookieHeader = (await cookies()).toString();
  return (
    <Suspense fallback={<ScansStatsSkeleton />}>
      <ScansStatsImpl cookieHeader={cookieHeader} />
    </Suspense>
  );
}
