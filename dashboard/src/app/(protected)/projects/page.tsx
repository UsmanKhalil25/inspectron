import { QuerySearch } from "@/components/ui/query-search";
import { PageHeader } from "@/components/ui/page-header";

import { CreateProjectDialog } from "./components/create-project-dialog";
import { ProjectsStats } from "./components/projects-stats";
import { ProjectsFilters } from "./components/projects-filters";
import { ProjectsTable } from "./components/projects-table";

export default async function ProjectsPage() {
  return (
    <main className="flex-1 space-y-6 p-6">
      <PageHeader
        title="Projects"
        description="Organize and manage your website scanning projects"
        action={<CreateProjectDialog />}
      />

      <ProjectsStats />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <QuerySearch
          placeholder="Search projects by name..."
          paramName="query"
        />
        <div className="flex-shrink-0">
          <ProjectsFilters />
        </div>
      </div>
      <ProjectsTable />
    </main>
  );
}
