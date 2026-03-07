import { Eye } from "lucide-react";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import type { CsvParsedRow } from "../types/csv-parsed-row.type";

interface ContactsPreviewTableProps {
  contacts: CsvParsedRow[];
  maxPreviewCount?: number;
}

function ContactsPreviewTable({
  contacts,
  maxPreviewCount = 100,
}: ContactsPreviewTableProps) {
  if (contacts.length === 0) return null;

  const headers = Object.keys(contacts[0] || {});
  const previewContacts = contacts.slice(0, maxPreviewCount);

  return (
    <div className="overflow-auto max-h-[500px] w-full rounded-md border">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead
                key={header}
                className="capitalize whitespace-nowrap min-w-[120px] px-4"
              >
                {header.replace("_", " ")}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {previewContacts.map((contact, index) => (
            <TableRow key={index}>
              {headers.map((header) => (
                <TableCell
                  key={header}
                  className="whitespace-nowrap min-w-[120px] px-4 max-w-[200px]"
                >
                  <div
                    className="truncate"
                    title={String(contact[header]) || "-"}
                  >
                    {String(contact[header]) || "-"}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

interface ContactsPreviewDialogProps {
  contacts: CsvParsedRow[];
}

function ContactsPreviewDialog({ contacts }: ContactsPreviewDialogProps) {
  const hasContacts = contacts.length > 0;
  const previewCount = Math.min(contacts.length, 100);
  const remainingCount = contacts.length - 100;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={!hasContacts}
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          Preview ({contacts.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preview Import Data</DialogTitle>
          <DialogDescription>
            Review your contacts before importing. Showing {previewCount} of{" "}
            {contacts.length} contacts.
          </DialogDescription>
        </DialogHeader>

        <ContactsPreviewTable contacts={contacts} />

        {remainingCount > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            ... and {remainingCount} more contacts
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export { ContactsPreviewDialog };
