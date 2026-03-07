import { cookies } from "next/headers";
import { Suspense } from "react";

import { ContactsTableImpl } from "./contacts-table-impl";
import { ContactsTableSkeleton } from "./contacts-table-skeleton";

export async function ContactsTable() {
  const cookieHeader = (await cookies()).toString();

  return (
    <Suspense fallback={<ContactsTableSkeleton />}>
      <ContactsTableImpl cookieHeader={cookieHeader} />
    </Suspense>
  );
}
