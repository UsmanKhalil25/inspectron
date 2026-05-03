import { Suspense } from "react";
import { cookies } from "next/headers";

import { ProjectsStatsImpl } from "./projects-stats-impl";
import { ProjectsStatsSkeleton } from "./projects-stats-skeleton";

export async function ProjectsStats() {
  const cookieHeader = (await cookies()).toString();
  return (
    <Suspense fallback={<ProjectsStatsSkeleton />}>
      <ProjectsStatsImpl cookieHeader={cookieHeader} />
    </Suspense>
  );
}
