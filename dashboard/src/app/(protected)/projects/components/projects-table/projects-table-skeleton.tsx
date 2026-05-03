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
  PROJECTS_TABLE_TITLE,
  PROJECTS_TABLE_DESCRIPTION,
  PROJECTS_TABLE_COLUMNS,
  DEFAULT_PROJECTS_PAGE_SIZE,
} from "../../constants";

function ProjectsTableRowSkeleton() {
  return (
    <tr className="group">
      <TableCell className="py-4 px-6 w-[250px]">
        <div className="w-36">
          <Skeleton className="h-4 w-full" />
        </div>
      </TableCell>
      <TableCell className="py-4 px-6 min-w-[200px]">
        <div className="w-48">
          <Skeleton className="h-4 w-full" />
        </div>
      </TableCell>
      <TableCell className="py-4 px-6 w-[100px]">
        <div className="w-12">
          <Skeleton className="h-4 w-full" />
        </div>
      </TableCell>
      <TableCell className="py-4 px-6 w-[120px]">
        <div className="w-20">
          <Skeleton className="h-6 w-full rounded-full" />
        </div>
      </TableCell>
      <TableCell className="py-4 px-6 w-[150px]">
        <div className="w-24">
          <Skeleton className="h-4 w-full" />
        </div>
      </TableCell>
    </tr>
  );
}

function ProjectsTableSkeleton() {
  return (
    <DataTableContainer
      title={PROJECTS_TABLE_TITLE}
      description={PROJECTS_TABLE_DESCRIPTION}
    >
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
          {Array.from({ length: DEFAULT_PROJECTS_PAGE_SIZE }).map(
            (_, index) => (
              <ProjectsTableRowSkeleton key={`skeleton-${index}`} />
            ),
          )}
        </TableBody>
      </Table>
    </DataTableContainer>
  );
}

export { ProjectsTableSkeleton };
