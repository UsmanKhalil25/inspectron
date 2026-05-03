import { PageHeader } from "@/components/ui/page-header";

import { DashboardStats } from "./components/dashboard-stats";
import { DashboardCharts } from "./components/dashboard-charts";
import { DashboardCategoryChart } from "./components/dashboard-category-chart";
import { DashboardProjectChart } from "./components/dashboard-project-chart";
import { DashboardRecentScans } from "./components/dashboard-recent-scans";

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

      <DashboardStats />

      <DashboardCharts />

      <DashboardCategoryChart />

      <DashboardProjectChart />

      <DashboardRecentScans />
    </main>
  );
}
