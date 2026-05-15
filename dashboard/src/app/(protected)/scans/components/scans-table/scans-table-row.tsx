import { useRouter } from "next/navigation";
import { TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Zap, Globe, BarChart3 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { SCAN_STATUS_BADGE } from "@/common/constants/scan-status-badge.constant";
import { SCANS_TABLE_COLUMN_WIDTHS } from "../../constants";

import { GetScansQuery, ScanStatus, ScanType } from "@/__generated__/graphql";
import { capitalize } from "@/common/utils/string.utils";

type Scan = GetScansQuery["scans"]["scans"][number];

interface ScansTableRowProps {
  scan: Scan;
}

function ScanStatusCell({ status }: { status: ScanStatus }) {
  return (
    <Badge variant={SCAN_STATUS_BADGE[status]} className="font-medium">
      {capitalize(status)}
    </Badge>
  );
}

function ScanTypeCell({ scanType }: { scanType: ScanType }) {
  const config = {
    [ScanType.Dynamic]: {
      label: "Dynamic",
      icon: Globe,
      className:
        "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20",
    },
    [ScanType.Static]: {
      label: "Static",
      icon: Zap,
      className:
        "bg-violet-500/10 text-violet-400 border-violet-500/20 hover:bg-violet-500/20",
    },
    [ScanType.Performance]: {
      label: "Performance",
      icon: BarChart3,
      className:
        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20",
    },
  };

  const {
    label,
    icon: Icon,
    className,
  } = config[scanType] ?? config[ScanType.Dynamic];

  return (
    <Badge variant="outline" className={`gap-1 font-medium ${className}`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

function ScanDateCell({ date }: { date: string }) {
  return (
    <span className="text-sm text-muted-foreground">
      {formatDistanceToNow(new Date(date), { addSuffix: true })}
    </span>
  );
}

function ScanUrlCell({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-2 max-w-[350px]">
      <span className="font-medium text-foreground truncate">{url}</span>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-foreground"
      >
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}
export function ScansTableRow({ scan }: ScansTableRowProps) {
  const router = useRouter();
  return (
    <tr
      className="group cursor-pointer hover:bg-muted/50"
      onClick={() => router.push(`scans/${scan.id}`)}
    >
      <TableCell className={SCANS_TABLE_COLUMN_WIDTHS.url}>
        <ScanUrlCell url={scan.url} />
      </TableCell>
      <TableCell className={SCANS_TABLE_COLUMN_WIDTHS.type}>
        <ScanTypeCell scanType={scan.scanType} />
      </TableCell>
      <TableCell className={SCANS_TABLE_COLUMN_WIDTHS.status}>
        <ScanStatusCell status={scan.status} />
      </TableCell>
      <TableCell className={SCANS_TABLE_COLUMN_WIDTHS.createdAt}>
        <ScanDateCell date={scan.createdAt} />
      </TableCell>
      <TableCell className={SCANS_TABLE_COLUMN_WIDTHS.updatedAt}>
        <ScanDateCell date={scan.updatedAt} />
      </TableCell>
    </tr>
  );
}
