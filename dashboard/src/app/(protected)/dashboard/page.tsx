import { PageHeader } from "@/components/ui/page-header";

import { ProjectVulnerabilitiesBarChart } from "./components/dashboard-charts/project-vulnerabilities-bar-chart";
import { VulnerabilitySeverityRadarChart } from "./components/dashboard-charts/vulnerability-severity-radar-chart";
import { ScanTrendLineChart } from "./components/dashboard-charts/scan-trend-line-chart";

export const metadata = {
  title: "Dashboard",
  description: "Overview of your security scanning projects",
};

export default function DashboardPage() {
  return (
    <main className="flex-1 space-y-6 p-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your security scanning projects and vulnerabilities."
      />
      <ProjectVulnerabilitiesBarChart />
      <div className="grid gap-6 md:grid-cols-3">
        <VulnerabilitySeverityRadarChart />
        <div className="md:col-span-2">
          <ScanTrendLineChart />
        </div>
      </div>
    </main>
  );
}
