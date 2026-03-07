"use client";

import { useSuspenseQuery } from "@apollo/client";
import { useSearchParams } from "next/navigation";

import { AlertTriangle, Megaphone } from "lucide-react";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableContainer } from "@/components/ui/data-table-container";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

import { CampaignsTableRow } from "./campaigns-table-row";

import { CAMPAIGNS } from "@/graphql/queries/campaigns";
import { useMapFilters } from "@/hooks/use-map-filters";

import {
  CAMPAIGNS_SEARCH_PARAMS,
  DEFAULT_CAMPAIGNS_PAGE_SIZE,
  CAMPAIGNS_TABLE_COLUMNS,
  CAMPAIGNS_TABLE_DESCRIPTION,
  CAMPAIGNS_TABLE_TITLE,
} from "../../constants";

interface StateProps {
  title?: string;
  description?: string;
}

function EmptyState({
  title = "No campaigns yet",
  description = "Get started by creating your first campaign to reach your audience and track performance.",
}: StateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 mb-6 rounded-full bg-muted flex items-center justify-center">
        <Megaphone className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-center mb-6 max-w-sm">
        {description}
      </p>
    </div>
  );
}

function ErrorState({
  title = "Failed to load campaigns",
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

export function CampaignsTableImpl({ cookieHeader }: { cookieHeader: string }) {
  const searchParams = useSearchParams();

  const { data, error } = useSuspenseQuery(CAMPAIGNS, {
    variables: useMapFilters({
      pageSize: DEFAULT_CAMPAIGNS_PAGE_SIZE,
      params: CAMPAIGNS_SEARCH_PARAMS,
      searchParams,
    }),
    context: {
      headers: {
        cookie: cookieHeader,
      },
    },
  });

  const campaigns = data?.campaigns?.campaigns || [];
  const currentPage = data?.campaigns?.pagination.page ?? 1;
  const totalPages = data?.campaigns?.pagination.totalPages ?? 1;
  const hasNextPage = data?.campaigns?.pagination.hasNextPage ?? false;
  const hasPreviousPage = data?.campaigns?.pagination.hasPreviousPage ?? false;

  const showPagination = totalPages > 1;
  const showError = error && campaigns.length === 0;
  const showEmpty = !error && campaigns.length === 0;

  const renderTable = () => (
    <>
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
          {campaigns.map((campaign) => (
            <CampaignsTableRow key={campaign.id} campaign={campaign} />
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
      title={CAMPAIGNS_TABLE_TITLE}
      description={CAMPAIGNS_TABLE_DESCRIPTION}
    >
      {getComponent()}
    </DataTableContainer>
  );
}
