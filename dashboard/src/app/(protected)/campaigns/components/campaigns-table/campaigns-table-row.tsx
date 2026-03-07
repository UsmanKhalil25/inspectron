import { MoreHorizontal } from "lucide-react";

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
import { formatDistanceToNow } from "date-fns";

import { CAMPAIGN_STATUS_BADGE } from "@/common/constants/campaign-status-badge.constant";
import { COMMUNICATION_CHANNEL_ICONS } from "@/common/constants/communication-channel-icons.constant";
import { CAMPAIGNS_TABLE_COLUMN_WIDTHS } from "../../constants";

import {
  GetCampaignsQuery,
  CommunicationChannel,
  CampaignStatus,
} from "@/__generated__/graphql";
import { capitalize } from "@/common/utils/string.utils";

type Campaign = GetCampaignsQuery["campaigns"]["campaigns"][number];

interface CampaignsTableRowProps {
  campaign: Campaign;
}

function CampaignChannelCell({
  channelType,
}: {
  channelType: CommunicationChannel;
}) {
  const Icon = COMMUNICATION_CHANNEL_ICONS[channelType];

  return (
    <div className="flex items-center gap-2.5">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      <span className="text-sm font-medium">{capitalize(channelType)}</span>
    </div>
  );
}

function CampaignStatusCell({ status }: { status: CampaignStatus }) {
  return (
    <Badge variant={CAMPAIGN_STATUS_BADGE[status]} className="font-medium">
      {capitalize(status)}
    </Badge>
  );
}

function CampaignDateCell({ date }: { date: string }) {
  return (
    <span className="text-sm text-muted-foreground">
      {formatDistanceToNow(new Date(date), { addSuffix: true })}
    </span>
  );
}

function CampaignActionsCell() {
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
        <DropdownMenuItem>Edit campaign</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">
          Delete campaign
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function CampaignsTableRow({ campaign }: CampaignsTableRowProps) {
  return (
    <tr className="group">
      <TableCell
        className={`font-semibold text-foreground ${CAMPAIGNS_TABLE_COLUMN_WIDTHS.title}`}
      >
        {campaign.title}
      </TableCell>
      <TableCell className={CAMPAIGNS_TABLE_COLUMN_WIDTHS.channelType}>
        <CampaignChannelCell channelType={campaign.channelType} />
      </TableCell>
      <TableCell className={CAMPAIGNS_TABLE_COLUMN_WIDTHS.status}>
        <CampaignStatusCell status={campaign.status} />
      </TableCell>
      <TableCell className={CAMPAIGNS_TABLE_COLUMN_WIDTHS.updatedAt}>
        <CampaignDateCell date={campaign.updatedAt} />
      </TableCell>
      <TableCell className={CAMPAIGNS_TABLE_COLUMN_WIDTHS.actions}>
        <CampaignActionsCell />
      </TableCell>
    </tr>
  );
}
