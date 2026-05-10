import { Suspense } from "react";
import { cookies } from "next/headers";

import { ProjectVulnerabilitiesBarChartImpl } from "./project-vulnerabilities-bar-chart-impl";
import { ProjectVulnerabilitiesBarChartSkeleton } from "./project-vulnerabilities-bar-chart-skeleton";

export async function ProjectVulnerabilitiesBarChart() {
  const cookieHeader = (await cookies()).toString();
  return (
    <Suspense fallback={<ProjectVulnerabilitiesBarChartSkeleton />}>
      <ProjectVulnerabilitiesBarChartImpl cookieHeader={cookieHeader} />
    </Suspense>
  );
}
