import { PageHeader } from "@/components/ui/page-header";

import { DashboardStats } from "./components/dashboard-stats";
import { ScanTrendBarChart } from "./components/dashboard-charts/scan-trend-bar-chart";
import { SeverityDistributionChart } from "./components/dashboard-charts/severity-distribution-chart";
import { ScanStatusDonutChart } from "./components/dashboard-charts/scan-status-donut-chart";
import { CategoryDistributionChart } from "./components/dashboard-charts/category-distribution-chart";

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

      <ScanTrendBarChart />

      <div className="grid gap-6 md:grid-cols-3">
        <SeverityDistributionChart />
        <ScanStatusDonutChart />
        <CategoryDistributionChart />
      </div>
    </main>
  );
}
