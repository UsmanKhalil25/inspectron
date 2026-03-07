import { QuerySearch } from "@/components/ui/query-search";
import { PageHeader } from "@/components/ui/page-header";

import { CreateScanDialog } from "./components/create-scan-dialog";
import { ScansStats } from "./components/scans-stats";
import { ScansFilters } from "./components/scans-filters";
import { ScansTable } from "./components/scans-table";

export default async function ScansPage() {
  return (
    <main className="flex-1 space-y-6 p-6">
      <PageHeader
        title="Scans"
        description="Manage and monitor all your website scans"
        action={<CreateScanDialog />}
      />

      <ScansStats />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <QuerySearch placeholder="Search scans by URL..." paramName="query" />
        <div className="flex-shrink-0">
          <ScansFilters />
        </div>
      </div>
      <ScansTable />
    </main>
  );
}
