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
  CAMPAIGNS_TABLE_DESCRIPTION,
  CAMPAIGNS_TABLE_TITLE,
  CAMPAIGNS_TABLE_COLUMNS,
  DEFAULT_CAMPAIGNS_PAGE_SIZE,
  CAMPAIGNS_TABLE_COLUMN_WIDTHS,
} from "../../constants";

function CampaignsTableRowSkeleton() {
  return (
    <tr className="group">
      <TableCell
        className={`font-semibold text-foreground py-4 px-6 ${CAMPAIGNS_TABLE_COLUMN_WIDTHS.title}`}
      >
        <div className="w-32">
          <Skeleton className="h-5 w-full" />
        </div>
      </TableCell>
      <TableCell className={`p-2 ${CAMPAIGNS_TABLE_COLUMN_WIDTHS.channelType}`}>
        <div className="w-20">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-4 w-4 flex-shrink-0" />
            <Skeleton className="h-4 w-16 flex-shrink-0" />
          </div>
        </div>
      </TableCell>
      <TableCell className={`p-2 ${CAMPAIGNS_TABLE_COLUMN_WIDTHS.status}`}>
        <div className="w-20">
          <Skeleton className="h-6 w-full rounded-full" />
        </div>
      </TableCell>
      <TableCell className={`p-2 ${CAMPAIGNS_TABLE_COLUMN_WIDTHS.updatedAt}`}>
        <div className="w-20">
          <Skeleton className="h-4 w-full" />
        </div>
      </TableCell>
      <TableCell className={`p-2 ${CAMPAIGNS_TABLE_COLUMN_WIDTHS.actions}`}>
        <div className="opacity-0 group-hover:opacity-100">
          <Skeleton className="h-8 w-8" />
        </div>
      </TableCell>
    </tr>
  );
}

export function CampaignsTableSkeleton() {
  return (
    <DataTableContainer
      title={CAMPAIGNS_TABLE_TITLE}
      description={CAMPAIGNS_TABLE_DESCRIPTION}
    >
      <Table>
        <TableHeader className="border-b border-border/50">
          <TableRow>
            {CAMPAIGNS_TABLE_COLUMNS.map((col) => (
              <TableHead key={col.key} className={`${col.className ?? ""}`}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: DEFAULT_CAMPAIGNS_PAGE_SIZE }).map(
            (_, index) => (
              <CampaignsTableRowSkeleton key={`skeleton-${index}`} />
            ),
          )}
        </TableBody>
      </Table>
    </DataTableContainer>
  );
}
