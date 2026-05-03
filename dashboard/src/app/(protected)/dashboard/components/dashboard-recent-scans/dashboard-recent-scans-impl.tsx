"use client";

import { useSuspenseQuery } from "@apollo/client";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ScanSearch } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { SCANS } from "@/graphql/queries/scans";
import { ScanSortBy, SortOrder } from "@/__generated__/graphql";
import { SCAN_STATUS_BADGE } from "@/common/constants/scan-status-badge.constant";
import { capitalize } from "@/common/utils/string.utils";

function DashboardRecentScansImpl({ cookieHeader }: { cookieHeader: string }) {
  const { data } = useSuspenseQuery(SCANS, {
    variables: {
      filters: { sortBy: ScanSortBy.UpdatedAt, sortOrder: SortOrder.Desc },
      limit: 5,
      page: 1,
    },
    context: { headers: { cookie: cookieHeader } },
  });

  const recentScans = data?.scans?.scans ?? [];

  if (recentScans.length === 0) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Recent Scans</CardTitle>
          <CardDescription>
            Latest scanning activity across projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 mb-6 rounded-full bg-muted flex items-center justify-center">
              <ScanSearch className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No scans yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Scans will appear here once you start scanning.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Recent Scans</CardTitle>
        <CardDescription>
          Latest scanning activity across projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentScans.map((scan) => (
              <TableRow
                key={scan.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => {
                  window.location.assign(`/scans/${scan.id}`);
                }}
              >
                <TableCell className="font-medium">
                  <Link
                    href={`/projects/${scan.project?.id}`}
                    className="hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {scan.project?.name || "—"}
                  </Link>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {scan.url}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={SCAN_STATUS_BADGE[scan.status] || "secondary"}
                    className="font-medium"
                  >
                    {capitalize(scan.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(scan.updatedAt), {
                    addSuffix: true,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export { DashboardRecentScansImpl };
