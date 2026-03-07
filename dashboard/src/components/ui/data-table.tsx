"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTableContainer } from "@/components/ui/data-table-container";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

interface DataTableProps<T> {
  title: string | React.ReactNode;
  description: string;
  data: T[];
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  loading: boolean;
  error?: Error;
  columns: { key: string; header: string; className?: string }[];
  renderRow: (item: T, index: number) => React.ReactNode;
  EmptyState: React.FC;
  ErrorState: React.FC;
  SkeletonRows: React.FC;
}

export function DataTable<T>({
  title,
  description,
  data,
  totalPages,
  currentPage,
  hasNextPage,
  hasPreviousPage,
  loading,
  error,
  columns,
  renderRow,
  EmptyState,
  ErrorState,
  SkeletonRows,
}: DataTableProps<T>) {
  const showError = !loading && error && data.length === 0;
  const showEmpty = !loading && !error && data.length === 0;
  const showPagination = !loading && totalPages > 1;
  const showSkeleton = loading && data.length === 0;

  const renderTableContent = () => {
    if (showSkeleton) {
      return <SkeletonRows />;
    }

    return data.map((item, idx) => renderRow(item, idx));
  };

  const renderTable = () => (
    <>
      <Table>
        <TableHeader className="border-b border-border/50">
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={`${col.className ?? ""}`}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>{renderTableContent()}</TableBody>
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
    <DataTableContainer title={title} description={description}>
      {getComponent()}
    </DataTableContainer>
  );
}
