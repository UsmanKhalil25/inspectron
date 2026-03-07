"use client";

import { useSuspenseQuery } from "@apollo/client";
import { useSearchParams } from "next/navigation";

import { AlertTriangle, ScanSearch } from "lucide-react";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableContainer } from "@/components/ui/data-table-container";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

import { ScansTableRow } from "./scans-table-row";

import { SCANS } from "@/graphql/queries/scans";
import { useMapFilters } from "@/hooks/use-map-filters";

import {
  SCANS_SEARCH_PARAMS,
  DEFAULT_SCANS_PAGE_SIZE,
  SCANS_TABLE_COLUMNS,
  SCANS_TABLE_DESCRIPTION,
  SCANS_TABLE_TITLE,
} from "../../constants";

interface StateProps {
  title?: string;
  description?: string;
}

function EmptyState({
  title = "No scans yet",
  description = "Get started by creating your first scan to analyze a website.",
}: StateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 mb-6 rounded-full bg-muted flex items-center justify-center">
        <ScanSearch className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-center mb-6 max-w-sm">
        {description}
      </p>
    </div>
  );
}

function ErrorState({
  title = "Failed to load scans",
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

export function ScansTableImpl({ cookieHeader }: { cookieHeader: string }) {
  const searchParams = useSearchParams();

  const { data, error } = useSuspenseQuery(SCANS, {
    variables: useMapFilters({
      pageSize: DEFAULT_SCANS_PAGE_SIZE,
      params: SCANS_SEARCH_PARAMS,
      searchParams,
    }),
    context: {
      headers: {
        cookie: cookieHeader,
      },
    },
  });

  const scans = data?.scans?.scans || [];
  const currentPage = data?.scans?.pagination.page ?? 1;
  const totalPages = data?.scans?.pagination.totalPages ?? 1;
  const hasNextPage = data?.scans?.pagination.hasNextPage ?? false;
  const hasPreviousPage = data?.scans?.pagination.hasPreviousPage ?? false;

  const showPagination = totalPages > 1;
  const showError = error && scans.length === 0;
  const showEmpty = !error && scans.length === 0;

  const renderTable = () => (
    <>
      <Table>
        <TableHeader className="border-b border-border/50">
          <TableRow>
            {SCANS_TABLE_COLUMNS.map((col) => (
              <TableHead key={col.key} className={`${col.className ?? ""}`}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {scans.map((scan) => (
            <ScansTableRow key={scan.id} scan={scan} />
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
      title={SCANS_TABLE_TITLE}
      description={SCANS_TABLE_DESCRIPTION}
    >
      {getComponent()}
    </DataTableContainer>
  );
}
