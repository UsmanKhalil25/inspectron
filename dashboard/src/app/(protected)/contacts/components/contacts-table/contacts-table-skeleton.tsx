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
  CONTACTS_TABLE_TITLE,
  CONTACTS_TABLE_DESCRIPTION,
  CONTACTS_TABLE_COLUMNS,
  CONTACTS_TABLE_COLUMN_WIDTHS,
  DEFAULT_CONTACTS_PAGE_SIZE,
} from "../../constants";

function ContactsTableRowSkeleton() {
  return (
    <tr className="group">
      <TableCell
        className={`font-semibold text-foreground ${CONTACTS_TABLE_COLUMN_WIDTHS.name}`}
      >
        <Skeleton className="h-5 w-32" />
      </TableCell>
      <TableCell className={CONTACTS_TABLE_COLUMN_WIDTHS.channels}>
        <div className="flex gap-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </TableCell>
      <TableCell className={CONTACTS_TABLE_COLUMN_WIDTHS.updatedAt}>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell className={CONTACTS_TABLE_COLUMN_WIDTHS.actions}>
        <div className="opacity-0 group-hover:opacity-100">
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </TableCell>
    </tr>
  );
}

function ContactsTableSkeleton() {
  return (
    <DataTableContainer
      title={CONTACTS_TABLE_TITLE}
      description={CONTACTS_TABLE_DESCRIPTION}
    >
      <Table>
        <TableHeader className="border-b border-border/50">
          <TableRow>
            {CONTACTS_TABLE_COLUMNS.map((col) => (
              <TableHead key={col.key} className={`${col.className ?? ""}`}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: DEFAULT_CONTACTS_PAGE_SIZE }).map(
            (_, index) => (
              <ContactsTableRowSkeleton key={`skeleton-${index}`} />
            ),
          )}
        </TableBody>
      </Table>
    </DataTableContainer>
  );
}

export { ContactsTableSkeleton };
