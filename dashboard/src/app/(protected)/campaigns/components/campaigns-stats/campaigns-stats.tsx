import { Suspense } from "react";
import { cookies } from "next/headers";

import { CampaignsStatsImpl } from "./campaigns-stats-impl";
import { CampaignsStatsSkeleton } from "./campaigns-stats-skeleton";

export async function CampaignsStats() {
  const cookieHeader = (await cookies()).toString();
  return (
    <Suspense fallback={<CampaignsStatsSkeleton />}>
      <CampaignsStatsImpl cookieHeader={cookieHeader} />
    </Suspense>
  );
}
