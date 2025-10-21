"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CrawlerForm } from "@/components/crawler-form";
import { TerminalOutput } from "@/components/terminal-output";
import { CrawlResults } from "@/components/crawl-results";
import { VulnerabilityResults } from "@/components/vulnerability-results";
import { SSEClient } from "@/lib/sse-client";
import {
  startCrawl,
  getCrawlStatus,
  startScan,
  getScanStatus,
  getCrawlLogsUrl,
  getScanLogsUrl,
  VulnerabilityResponse,
} from "@/lib/api-client";
import { Shield, Loader2 } from "lucide-react";

type JobStatus = "idle" | "crawling" | "completed" | "failed" | "scanning";

export default function Home() {
  const [jobStatus, setJobStatus] = useState<JobStatus>("idle");
  const [crawlJobId, setCrawlJobId] = useState<string | null>(null);
  const [scanJobId, setScanJobId] = useState<string | null>(null);
  const [crawlLogs, setCrawlLogs] = useState<string[]>([]);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [discoveredUrls, setDiscoveredUrls] = useState<string[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<
    VulnerabilityResponse[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("crawl");

  const handleStartCrawl = async (url: string) => {
    try {
      setError(null);
      setCrawlLogs([]);
      setDiscoveredUrls([]);
      setVulnerabilities([]);
      setScanLogs([]);
      setJobStatus("crawling");

      const response = await startCrawl(url);
      setCrawlJobId(response.job_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start crawl");
      setJobStatus("failed");
    }
  };

  const handleStartScan = async () => {
    if (!crawlJobId) return;

    try {
      setError(null);
      setScanLogs([]);
      setVulnerabilities([]);
      setJobStatus("scanning");
      setActiveTab("scan");

      const response = await startScan(crawlJobId);
      setScanJobId(response.job_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start scan");
      setJobStatus("completed");
    }
  };

  // Poll crawl status
  useEffect(() => {
    if (!crawlJobId || jobStatus !== "crawling") return;

    const interval = setInterval(async () => {
      try {
        const status = await getCrawlStatus(crawlJobId);

        if (status.status === "completed") {
          setDiscoveredUrls(status.urls);
          setJobStatus("completed");
          clearInterval(interval);
        } else if (status.status === "failed") {
          setError(status.error || "Crawl failed");
          setJobStatus("failed");
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Failed to get crawl status:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [crawlJobId, jobStatus]);

  // Poll scan status
  useEffect(() => {
    if (!scanJobId || jobStatus !== "scanning") return;

    const interval = setInterval(async () => {
      try {
        const status = await getScanStatus(scanJobId);

        if (status.status === "completed") {
          setVulnerabilities(status.vulnerabilities);
          setJobStatus("completed");
          clearInterval(interval);
        } else if (status.status === "failed") {
          setError(status.error || "Scan failed");
          setJobStatus("completed");
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Failed to get scan status:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [scanJobId, jobStatus]);

  // Stream crawl logs
  useEffect(() => {
    if (!crawlJobId) return;

    const sseClient = new SSEClient(getCrawlLogsUrl(crawlJobId));

    sseClient.onMessage((message) => {
      setCrawlLogs((prev) => [...prev, message]);
    });

    return () => {
      sseClient.close();
    };
  }, [crawlJobId]);

  // Stream scan logs
  useEffect(() => {
    if (!scanJobId) return;

    const sseClient = new SSEClient(getScanLogsUrl(scanJobId));

    sseClient.onMessage((message) => {
      setScanLogs((prev) => [...prev, message]);
    });

    return () => {
      sseClient.close();
    };
  }, [scanJobId]);

  const canScan =
    jobStatus === "completed" && discoveredUrls.length > 0 && !scanJobId;
  const isLoading = jobStatus === "crawling" || jobStatus === "scanning";

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Inspectron
            </span>
          </h1>
          <p className="text-slate-600">
            Web Crawler & Vulnerability Scanner
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Start Crawling</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <CrawlerForm
              onSubmit={handleStartCrawl}
              isLoading={jobStatus === "crawling"}
            />

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                <strong>Error:</strong> {error}
              </div>
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>
                  {jobStatus === "crawling"
                    ? "Crawling website..."
                    : "Scanning for vulnerabilities..."}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs for Logs */}
        {crawlJobId && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="crawl">Crawl Logs</TabsTrigger>
              <TabsTrigger value="scan" disabled={!scanJobId}>
                Scan Logs
              </TabsTrigger>
            </TabsList>
            <TabsContent value="crawl" className="mt-4">
              <TerminalOutput logs={crawlLogs} />
            </TabsContent>
            <TabsContent value="scan" className="mt-4">
              <TerminalOutput logs={scanLogs} />
            </TabsContent>
          </Tabs>
        )}

        {/* Results Section */}
        {discoveredUrls.length > 0 && (
          <>
            <div className="flex items-center gap-4">
              <CrawlResults urls={discoveredUrls} />
            </div>

            {canScan && (
              <div className="flex justify-center">
                <Button
                  onClick={handleStartScan}
                  size="lg"
                  className="gap-2"
                  variant="default"
                >
                  <Shield className="h-5 w-5" />
                  Run Vulnerability Scan
                </Button>
              </div>
            )}
          </>
        )}

        {/* Vulnerability Results */}
        {vulnerabilities.length > 0 && (
          <VulnerabilityResults vulnerabilities={vulnerabilities} />
        )}

        {jobStatus === "completed" && vulnerabilities.length === 0 && scanJobId && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-slate-600">
                <Shield className="h-12 w-12 mx-auto mb-2 text-green-600" />
                <p className="text-lg font-semibold">No vulnerabilities found!</p>
                <p className="text-sm">The scanned URLs appear to be secure.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
