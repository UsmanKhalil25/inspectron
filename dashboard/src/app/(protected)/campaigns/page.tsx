import { QuerySearch } from "@/components/ui/query-search";
import { PageHeader } from "@/components/ui/page-header";

import { CreateCampaignDialog } from "./components/create-campaign-dialog";
import { CampaignsStats } from "./components/campaigns-stats";
import { CampaignsFilters } from "./components/campaigns-filters";
import { CampaignsTable } from "./components/campaigns-table";

export default async function CampaignsPage() {
  return (
    <main className="flex-1 space-y-6 p-6">
      <PageHeader
        title="Campaigns"
        description="Manage and monitor all your marketing campaigns"
        action={<CreateCampaignDialog />}
      />

      <CampaignsStats />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <QuerySearch
          placeholder="Search campaigns by name..."
          paramName="query"
        />
        <div className="flex-shrink-0">
          <CampaignsFilters />
        </div>
      </div>
      <CampaignsTable />
    </main>
  );
}
