import { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";

import { ScanDetailImpl, ScanDetailSkeleton } from "./components/scan-detail";


export const metadata: Metadata = {
  title: "Scan Details",
  description: "View scan progress and results",
};

export default async function ScanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieHeader = (await cookies()).toString();

  return (
    <Suspense fallback={<ScanDetailSkeleton />}>
      <ScanDetailImpl scanId={id} cookieHeader={cookieHeader} />
    </Suspense>
  );
}
