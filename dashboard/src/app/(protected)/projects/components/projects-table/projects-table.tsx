import { cookies } from "next/headers";
import { Suspense } from "react";

import { ProjectsTableImpl } from "./projects-table-impl";
import { ProjectsTableSkeleton } from "./projects-table-skeleton";

export async function ProjectsTable() {
  const cookieHeader = (await cookies()).toString();

  return (
    <Suspense fallback={<ProjectsTableSkeleton />}>
      <ProjectsTableImpl cookieHeader={cookieHeader} />
    </Suspense>
  );
}
