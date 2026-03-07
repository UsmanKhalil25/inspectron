import { cookies } from "next/headers";
import { Suspense } from "react";

import { CampaignsTableImpl } from "./campaigns-table-impl";
import { CampaignsTableSkeleton } from "./campaigns-table-skeleton";

export async function CampaignsTable() {
  const cookieHeader = (await cookies()).toString();

  return (
    <Suspense fallback={<CampaignsTableSkeleton />}>
      <CampaignsTableImpl cookieHeader={cookieHeader} />
    </Suspense>
  );
}
