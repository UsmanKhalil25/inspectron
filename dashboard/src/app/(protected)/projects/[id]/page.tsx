import { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";

import {
  ProjectDetailImpl,
  ProjectDetailSkeleton,
} from "./components/project-detail";

export const metadata: Metadata = {
  title: "Project Details",
  description: "View project details and scans",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieHeader = (await cookies()).toString();

  return (
    <Suspense fallback={<ProjectDetailSkeleton />}>
      <ProjectDetailImpl projectId={id} cookieHeader={cookieHeader} />
    </Suspense>
  );
}
