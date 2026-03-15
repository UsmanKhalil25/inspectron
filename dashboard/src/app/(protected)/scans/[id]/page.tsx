import { Metadata } from "next";
import { ScanDetailHeader } from "./components/scan-detail-header";
import { BrowserPreview } from "./components/browser-preview";
import { AgentActivity } from "./components/agent-activity";

export const metadata: Metadata = {
  title: "Scan Details",
  description: "View scan progress and results",
};

const SCAN_URL = "https://example.com";

export default function ScanDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background">
      <ScanDetailHeader url={SCAN_URL} status="Active" scanId={params.id} />
      <div className="flex flex-1 overflow-hidden">
        <BrowserPreview url={SCAN_URL} />
        <AgentActivity url={SCAN_URL} />
      </div>
    </div>
  );
}
