import { QuerySearch } from "@/components/ui/query-search";
import { PageHeader } from "@/components/ui/page-header";

import { CreateContactDialog } from "./components/create-contact-dialog";
import { ContactsFilters } from "./components/contacts-filters";
import { ContactsTable } from "./components/contacts-table";

export default function ContactsPage() {
  return (
    <main className="flex-1 space-y-6 p-6">
      <PageHeader
        title="Contacts"
        description="View, organize, and manage all your contacts in one place"
        action={<CreateContactDialog />}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <QuerySearch
          placeholder="Search contacts by name, email, or sms number..."
          paramName="query"
        />

        <div className="flex-shrink-0">
          <ContactsFilters />
        </div>
      </div>

      <ContactsTable />
    </main>
  );
}
