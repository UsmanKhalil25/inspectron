"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface CampaignsStatusFilterConfig {
  label: string;
  bgColor: string;
}

const statusConfigs: Record<string, CampaignsStatusFilterConfig> = {
  all: { label: "All Status", bgColor: "bg-muted" },
  active: { label: "Active", bgColor: "bg-green-500" },
  queued: { label: "Queued", bgColor: "bg-blue-500" },
  completed: { label: "Completed", bgColor: "bg-emerald-500" },
  draft: { label: "Draft", bgColor: "bg-gray-400" },
  failed: { label: "Failed", bgColor: "bg-red-500" },
};

function CampaignsStatusFilterFallback() {
  return (
    <Button
      variant="outline"
      disabled
      className="h-10 px-4 justify-between min-w-[140px] bg-background border-border/60"
    >
      <div className="flex items-center gap-2">
        <Skeleton className="w-2 h-2 rounded-full" />
        <Skeleton className="h-4 w-[80px]" />
      </div>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </Button>
  );
}

function CampaignsStatusFilterInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const status = searchParams.get("status") || "all";
  const currentConfig = statusConfigs[status] || statusConfigs.all;

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("status", value);
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 px-4 justify-between min-w-[140px] bg-muted/40 rounded-md border border-border/60"
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${currentConfig.bgColor}`} />
            <span className="text-sm font-medium w-[80px] truncate">
              {currentConfig.label}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="space-y-1">
          <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
            Filter by Status
          </div>
          <Separator />
          {Object.entries(statusConfigs).map(([value, config]) => (
            <Button
              key={value}
              variant="ghost"
              className={`w-full justify-start h-9 px-2 ${
                status === value ? "bg-accent text-accent-foreground" : ""
              }`}
              onClick={() => handleChange(value)}
            >
              <div className={`w-2 h-2 rounded-full ${config.bgColor} mr-3`} />
              <span className="text-sm">{config.label}</span>
              {status === value && <Check className="ml-auto h-3 w-3" />}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function CampaignsStatusFilter() {
  return (
    <Suspense fallback={<CampaignsStatusFilterFallback />}>
      <CampaignsStatusFilterInner />
    </Suspense>
  );
}
