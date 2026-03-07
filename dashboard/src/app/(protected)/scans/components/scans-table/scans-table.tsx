import { cookies } from "next/headers";
import { Suspense } from "react";

import { ScansTableImpl } from "./scans-table-impl";
import { ScansTableSkeleton } from "./scans-table-skeleton";

export async function ScansTable() {
  const cookieHeader = (await cookies()).toString();

  return (
    <Suspense fallback={<ScansTableSkeleton />}>
      <ScansTableImpl cookieHeader={cookieHeader} />
    </Suspense>
  );
}
