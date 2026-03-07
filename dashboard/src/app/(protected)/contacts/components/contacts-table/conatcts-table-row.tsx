import { MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { COMMUNICATION_CHANNEL_ICONS } from "@/common/constants/communication-channel-icons.constant";

import {
  type GetContactsQuery,
  CommunicationChannel,
} from "@/__generated__/graphql";
import { CONTACTS_TABLE_COLUMN_WIDTHS } from "../../constants";

type contact = GetContactsQuery["contacts"]["contacts"][number];

interface ContactsTableRowProps {
  contact: contact;
}

function DateCell({ date }: { date: string }) {
  return (
    <span className="text-sm text-muted-foreground">
      {formatDistanceToNow(new Date(date), { addSuffix: true })}
    </span>
  );
}

function ContactActionsCell() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>View details</DropdownMenuItem>
        <DropdownMenuItem>Edit contact</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">
          Delete contact
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ChannelsCell({ contact }: { contact: contact }) {
  return (
    <div className="flex gap-1">
      {contact.contactChannels.map((channel) => {
        const IconComponent =
          COMMUNICATION_CHANNEL_ICONS[channel.type as CommunicationChannel];
        return (
          <Badge
            key={channel.id}
            variant="secondary"
            className="flex items-center gap-1 text-xs"
          >
            <IconComponent className="h-3 w-3" />
            {channel.value}
          </Badge>
        );
      })}
    </div>
  );
}

export function ContactsTableRow({ contact }: ContactsTableRowProps) {
  return (
    <tr className="group">
      <TableCell
        className={`font-semibold text-foreground ${CONTACTS_TABLE_COLUMN_WIDTHS.name}`}
      >
        {contact.name}
      </TableCell>
      <TableCell className={CONTACTS_TABLE_COLUMN_WIDTHS.channels}>
        <ChannelsCell contact={contact} />
      </TableCell>
      <TableCell className={CONTACTS_TABLE_COLUMN_WIDTHS.updatedAt}>
        <DateCell date={contact.updatedAt} />
      </TableCell>
      <TableCell className={CONTACTS_TABLE_COLUMN_WIDTHS.actions}>
        <ContactActionsCell />
      </TableCell>
    </tr>
  );
}
