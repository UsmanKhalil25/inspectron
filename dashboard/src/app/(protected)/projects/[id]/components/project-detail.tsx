"use client";

import { useSuspenseQuery } from "@apollo/client";
import {
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  FolderKanban,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { PROJECT } from "@/graphql/queries/project";
import { PROJECT_VULNERABILITY_STATS } from "@/graphql/queries/project-vulnerability-stats";
import { SCAN_STATUS_BADGE } from "@/common/constants/scan-status-badge.constant";
import { capitalize } from "@/common/utils/string.utils";
import {
  ScanStatus,
  GetProjectQuery,
  VulnerabilitySeverity,
} from "@/__generated__/graphql";

import { ProjectScans } from "./project-scans";

interface ProjectDetailImplProps {
  projectId: string;
  cookieHeader: string;
}

function ErrorState() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background px-4">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">Failed to load project</h3>
      <p className="mb-6 max-w-sm text-center text-muted-foreground">
        We&apos;re having trouble connecting to our servers. Please check your
        connection and try again.
      </p>
    </div>
  );
}

function ProjectDetailHeader({
  project,
}: {
  project: NonNullable<GetProjectQuery["project"]>;
}) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4 sticky top-0 z-10">
      <Link href="/projects">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </Button>
      </Link>

      <div className="h-4 w-px bg-border" />

      <div className="flex items-center gap-2 min-w-0">
        <FolderKanban className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate text-xs text-foreground font-medium">
          {project.name}
        </span>
      </div>

      <div className="flex-1" />

      {project.lastScanStatus && (
        <Badge
          variant={SCAN_STATUS_BADGE[project.lastScanStatus as ScanStatus]}
          className="font-medium"
        >
          {capitalize(project.lastScanStatus)}
        </Badge>
      )}
    </header>
  );
}

const SEVERITY_ORDER = [
  {
    key: "critical",
    label: "Critical",
    severity: VulnerabilitySeverity.Critical,
  },
  { key: "high", label: "High", severity: VulnerabilitySeverity.High },
  { key: "medium", label: "Medium", severity: VulnerabilitySeverity.Medium },
  { key: "low", label: "Low", severity: VulnerabilitySeverity.Low },
  { key: "info", label: "Info", severity: VulnerabilitySeverity.Info },
] as const;

export function ProjectDetailImpl({
  projectId,
  cookieHeader,
}: ProjectDetailImplProps) {
  const context = { headers: { cookie: cookieHeader } };

  const { data, error } = useSuspenseQuery(PROJECT, {
    variables: { id: projectId },
    context,
  });

  const { data: projectVulnData } = useSuspenseQuery(
    PROJECT_VULNERABILITY_STATS,
    { context },
  );

  if (error) {
    return <ErrorState />;
  }

  const project = data?.project;

  if (!project) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background px-4">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <AlertTriangle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">Project not found</h3>
        <p className="max-w-sm text-center text-muted-foreground">
          The project you&apos;re looking for doesn&apos;t exist or you
          don&apos;t have access to it.
        </p>
      </div>
    );
  }

  const projectVuln = projectVulnData?.projectVulnerabilityStats?.find(
    (p) => p.projectId === projectId,
  );

  const totalVulns = projectVuln?.total ?? 0;
  const criticalCount = projectVuln?.critical ?? 0;

  const severityCounts = SEVERITY_ORDER.map((s) => ({
    ...s,
    count: (projectVuln?.[s.key] as number) ?? 0,
  }));

  const hasVulnerabilities = severityCounts.some((s) => s.count > 0);

  return (
    <div className="flex flex-col bg-background">
      <ProjectDetailHeader project={project} />

      <div className="flex-1 p-6 space-y-6">
        {/* Project Info Card */}
        <Card className="rounded-2xl shadow-sm border">
          <CardHeader className="pb-2 px-5 pt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FolderKanban className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold tracking-tight">
                    {project.name}
                  </CardTitle>
                  {project.lastScanStatus && (
                    <Badge
                      variant={
                        SCAN_STATUS_BADGE[project.lastScanStatus as ScanStatus]
                      }
                      className="font-medium mt-1 text-[10px]"
                    >
                      {capitalize(project.lastScanStatus)}
                    </Badge>
                  )}
                </div>
              </div>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-background hover:bg-muted transition-colors"
              >
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 px-5 pb-5">
            {/* URL */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                URL
              </p>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1.5"
              >
                {project.url}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl bg-muted/30 border border-border/50 p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Scans
                </p>
                <p className="text-xl font-bold tabular-nums">
                  {project.scanCount}
                </p>
              </div>
              <div className="rounded-xl bg-muted/30 border border-border/50 p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Vulnerabilities
                </p>
                <p className="text-xl font-bold tabular-nums">{totalVulns}</p>
              </div>
              <div className="rounded-xl bg-muted/30 border border-border/50 p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Critical
                </p>
                <p
                  className={`text-xl font-bold tabular-nums ${
                    criticalCount > 0 ? "text-destructive" : ""
                  }`}
                >
                  {criticalCount}
                </p>
              </div>
              <div className="rounded-xl bg-muted/30 border border-border/50 p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Created
                </p>
                <p className="text-sm font-medium">
                  {formatDistanceToNow(new Date(project.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            {/* Description */}
            {project.description && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                  Description
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {project.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vulnerability Summary */}
        {hasVulnerabilities && (
          <Card className="rounded-2xl shadow-sm border">
            <CardHeader className="pb-2 px-5 pt-5">
              <CardTitle className="text-base font-semibold tracking-tight">
                Vulnerability Summary
              </CardTitle>
              <CardDescription className="text-sm">
                Severity breakdown for this project
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="grid grid-cols-5 gap-3">
                {severityCounts.map((s) => (
                  <div
                    key={s.key}
                    className="flex flex-col items-center justify-center rounded-xl bg-muted/30 border border-border/50 p-3 text-center"
                  >
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      {s.label}
                    </span>
                    <span
                      className={`text-xl font-bold tabular-nums ${
                        s.count > 0 && s.key === "critical"
                          ? "text-destructive"
                          : ""
                      }`}
                    >
                      {s.count}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scans */}
        <ProjectScans
          projectId={project.id}
          projectUrl={project.url}
          cookieHeader={cookieHeader}
        />
      </div>
    </div>
  );
}

export { ProjectDetailSkeleton } from "./project-detail-skeleton";
