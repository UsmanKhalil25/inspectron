import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableContainer } from "@/components/ui/data-table-container";
import { Skeleton } from "@/components/ui/skeleton";

import {
  SCANS_TABLE_DESCRIPTION,
  SCANS_TABLE_TITLE,
  SCANS_TABLE_COLUMNS,
  DEFAULT_SCANS_PAGE_SIZE,
  SCANS_TABLE_COLUMN_WIDTHS,
} from "../../constants";

function ScansTableRowSkeleton() {
  return (
    <tr className="group">
      <TableCell
        className={`font-medium text-foreground py-4 px-6 ${SCANS_TABLE_COLUMN_WIDTHS.url}`}
      >
        <div className="w-64">
          <Skeleton className="h-4 w-full" />
        </div>
      </TableCell>
      <TableCell className={`p-2 ${SCANS_TABLE_COLUMN_WIDTHS.status}`}>
        <div className="w-20">
          <Skeleton className="h-6 w-full rounded-full" />
        </div>
      </TableCell>
      <TableCell className={`p-2 ${SCANS_TABLE_COLUMN_WIDTHS.createdAt}`}>
        <div className="w-24">
          <Skeleton className="h-4 w-full" />
        </div>
      </TableCell>
      <TableCell className={`p-2 ${SCANS_TABLE_COLUMN_WIDTHS.updatedAt}`}>
        <div className="w-24">
          <Skeleton className="h-4 w-full" />
        </div>
      </TableCell>
    </tr>
  );
}

export function ScansTableSkeleton() {
  return (
    <DataTableContainer
      title={SCANS_TABLE_TITLE}
      description={SCANS_TABLE_DESCRIPTION}
    >
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
          {Array.from({ length: DEFAULT_SCANS_PAGE_SIZE }).map((_, index) => (
            <ScansTableRowSkeleton key={`skeleton-${index}`} />
          ))}
        </TableBody>
      </Table>
    </DataTableContainer>
  );
}
