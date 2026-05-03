"use client";

import { useSuspenseQuery } from "@apollo/client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { AlertTriangle, FolderKanban } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableContainer } from "@/components/ui/data-table-container";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Badge } from "@/components/ui/badge";

import { PROJECTS } from "@/graphql/queries/projects";
import { useMapFilters } from "@/hooks/use-map-filters";

import {
  PROJECTS_SEARCH_PARAMS,
  DEFAULT_PROJECTS_PAGE_SIZE,
  PROJECTS_TABLE_TITLE,
  PROJECTS_TABLE_DESCRIPTION,
  PROJECTS_TABLE_COLUMNS,
} from "../../constants";

import { GetProjectsQuery, ScanStatus } from "@/__generated__/graphql";
import { capitalize } from "@/common/utils/string.utils";
import { SCAN_STATUS_BADGE } from "@/common/constants/scan-status-badge.constant";

type Project = GetProjectsQuery["projects"]["projects"][number];

interface StateProps {
  title?: string;
  description?: string;
}

function EmptyState({
  title = "No projects yet",
  description = "Get started by creating your first project to organize your scans.",
}: StateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 mb-6 rounded-full bg-muted flex items-center justify-center">
        <FolderKanban className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-center mb-6 max-w-sm">
        {description}
      </p>
    </div>
  );
}

function ErrorState({
  title = "Failed to load projects",
  description = "We're having trouble connecting to our servers. Please check your connection and try again.",
}: StateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-center mb-6 max-w-sm">
        {description}
      </p>
    </div>
  );
}

function ProjectsTableRow({ project }: { project: Project }) {
  const router = useRouter();

  return (
    <tr
      className="group cursor-pointer hover:bg-muted/50"
      onClick={() => router.push(`/projects/${project.id}`)}
    >
      <td className="w-[250px] p-4">
        <span className="font-medium text-foreground">{project.name}</span>
      </td>
      <td className="min-w-[200px] p-4">
        <span className="text-sm text-muted-foreground truncate block max-w-[250px]">
          {project.url}
        </span>
      </td>
      <td className="w-[100px] p-4">
        <span className="text-sm font-medium">{project.scanCount}</span>
      </td>
      <td className="w-[120px] p-4">
        {project.lastScanStatus ? (
          <Badge
            variant={SCAN_STATUS_BADGE[project.lastScanStatus as ScanStatus]}
            className="font-medium"
          >
            {capitalize(project.lastScanStatus)}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )}
      </td>
      <td className="w-[150px] p-4">
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(project.createdAt), {
            addSuffix: true,
          })}
        </span>
      </td>
    </tr>
  );
}

export function ProjectsTableImpl({ cookieHeader }: { cookieHeader: string }) {
  const searchParams = useSearchParams();

  const { data, error } = useSuspenseQuery(PROJECTS, {
    variables: useMapFilters({
      pageSize: DEFAULT_PROJECTS_PAGE_SIZE,
      params: PROJECTS_SEARCH_PARAMS,
      searchParams,
    }),
    context: {
      headers: {
        cookie: cookieHeader,
      },
    },
  });

  const projects = data?.projects?.projects || [];

  const currentPage = data?.projects?.pagination.page ?? 1;
  const totalPages = data?.projects?.pagination.totalPages ?? 1;
  const hasNextPage = data?.projects?.pagination.hasNextPage ?? false;
  const hasPreviousPage = data?.projects?.pagination.hasPreviousPage ?? false;

  const showPagination = totalPages > 1;
  const showError = error && projects.length === 0;
  const showEmpty = !error && projects.length === 0;

  const renderTable = () => (
    <>
      <Table>
        <TableHeader className="border-b border-border/50">
          <TableRow>
            {PROJECTS_TABLE_COLUMNS.map((col) => (
              <TableHead key={col.key} className={`${col.className ?? ""}`}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <ProjectsTableRow key={project.id} project={project} />
          ))}
        </TableBody>
      </Table>

      {showPagination && (
        <div className="mt-8 flex justify-center">
          <DataTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
          />
        </div>
      )}
    </>
  );

  const getComponent = () => {
    if (showError) {
      return <ErrorState />;
    }

    if (showEmpty) {
      return <EmptyState />;
    }

    return renderTable();
  };

  return (
    <DataTableContainer
      title={PROJECTS_TABLE_TITLE}
      description={PROJECTS_TABLE_DESCRIPTION}
    >
      {getComponent()}
    </DataTableContainer>
  );
}
