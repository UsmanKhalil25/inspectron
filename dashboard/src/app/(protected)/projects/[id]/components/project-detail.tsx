"use client";

import { useSuspenseQuery } from "@apollo/client";
import { AlertTriangle } from "lucide-react";
import { ArrowLeft, ExternalLink, FolderKanban } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { PROJECT } from "@/graphql/queries/project";
import { SCAN_STATUS_BADGE } from "@/common/constants/scan-status-badge.constant";
import { capitalize } from "@/common/utils/string.utils";
import { ScanStatus, GetProjectQuery } from "@/__generated__/graphql";

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
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-zinc-800 bg-zinc-950 px-4">
      <Link href="/projects">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </Button>
      </Link>

      <div className="h-4 w-px bg-zinc-800" />

      <div className="flex items-center gap-2 min-w-0">
        <FolderKanban className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
        <span className="truncate text-xs text-zinc-200 font-medium">
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

export function ProjectDetailImpl({
  projectId,
  cookieHeader,
}: ProjectDetailImplProps) {
  const context = { headers: { cookie: cookieHeader } };

  const { data, error } = useSuspenseQuery(PROJECT, {
    variables: { id: projectId },
    context,
  });

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

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background">
      <ProjectDetailHeader project={project} />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-primary" />
              {project.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">URL</p>
                <div className="flex items-center gap-2 mt-1">
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {project.url}
                  </a>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
              {project.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm mt-1">{project.description}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Scans</p>
                <p className="text-sm mt-1 font-medium">{project.scanCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm mt-1">
                  {formatDistanceToNow(new Date(project.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

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
