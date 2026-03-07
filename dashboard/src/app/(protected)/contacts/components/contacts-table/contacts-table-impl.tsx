"use client";

import { useSuspenseQuery } from "@apollo/client";
import { useSearchParams } from "next/navigation";

import { AlertTriangle, Users } from "lucide-react";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableContainer } from "@/components/ui/data-table-container";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

import { CONTACTS } from "@/graphql/queries/contacts";
import { useMapFilters } from "@/hooks/use-map-filters";
import {
  CONTACTS_SEARCH_PARAMS,
  CONTACTS_TABLE_COLUMNS,
  CONTACTS_TABLE_TITLE,
  CONTACTS_TABLE_DESCRIPTION,
  DEFAULT_CONTACTS_PAGE_SIZE,
} from "../../constants";

import { ContactsTableRow } from "./conatcts-table-row";

interface StateProps {
  title?: string;
  description?: string;
}

function EmptyState({
  title = "No contacts yet",
  description = "Get started by adding your first contact to build your audience and manage communications.",
}: StateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 mb-6 rounded-full bg-muted flex items-center justify-center">
        <Users className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-center mb-6 max-w-sm">
        {description}
      </p>
    </div>
  );
}

function ErrorState({
  title = "Failed to load contacts",
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

export function ContactsTableImpl({ cookieHeader }: { cookieHeader: string }) {
  const searchParams = useSearchParams();

  const { data, error } = useSuspenseQuery(CONTACTS, {
    variables: useMapFilters({
      pageSize: DEFAULT_CONTACTS_PAGE_SIZE,
      params: CONTACTS_SEARCH_PARAMS,
      searchParams,
    }),
    context: {
      headers: {
        cookie: cookieHeader,
      },
    },
  });

  const contacts = data?.contacts?.contacts || [];
  const currentPage = data?.contacts?.pagination.page ?? 1;
  const totalPages = data?.contacts?.pagination.totalPages ?? 1;
  const hasNextPage = data?.contacts?.pagination.hasNextPage ?? false;
  const hasPreviousPage = data?.contacts?.pagination.hasPreviousPage ?? false;

  const showPagination = totalPages > 1;
  const showError = error && contacts.length === 0;
  const showEmpty = !error && contacts.length === 0;

  const renderTable = () => (
    <>
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
          {contacts.map((contact) => (
            <ContactsTableRow key={contact.id} contact={contact} />
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
      title={CONTACTS_TABLE_TITLE}
      description={CONTACTS_TABLE_DESCRIPTION}
    >
      {getComponent()}
    </DataTableContainer>
  );
}
