"use client";

import { Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

import { cn } from "@/lib/utils";

import { Skeleton } from "./skeleton";
import { Button } from "@/components/ui/button";

function SortOrderButtonFallback({ className }: { className?: string }) {
  return (
    <Button
      variant="ghost"
      disabled
      className={cn(
        "h-10 px-4 rounded-none border-0 bg-transparent hover:bg-background/80",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        <Skeleton className="h-4 w-[80px] rounded-sm" />
      </div>
    </Button>
  );
}

export type SortOrder = "asc" | "desc";

interface SortOrderButtonProps {
  paramKey: string;
  labels?: {
    asc: string;
    desc: string;
  };
  disabled?: boolean;
  className?: string;
}

function SortOrderButtonInner({
  paramKey = "sortOrder",
  labels = { asc: "Ascending", desc: "Descending" },
  disabled = false,
  className,
}: SortOrderButtonProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentOrder =
    (searchParams.get(paramKey) as SortOrder | null) ?? "desc";

  const handleToggle = () => {
    const nextOrder = currentOrder === "desc" ? "asc" : "desc";
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set(paramKey, nextOrder);
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const currentLabel = currentOrder === "desc" ? labels.desc : labels.asc;

  return (
    <Button
      variant="ghost"
      disabled={disabled}
      className={cn(
        "h-10 px-4 rounded-none border-0 bg-transparent hover:bg-background/80",
        className,
      )}
      onClick={handleToggle}
      aria-label={`Sort order: ${currentLabel}`}
    >
      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium w-[80px] truncate">
          {currentLabel}
        </span>
      </div>
    </Button>
  );
}

export function SortOrderButton(props: SortOrderButtonProps) {
  return (
    <Suspense fallback={<SortOrderButtonFallback />}>
      <SortOrderButtonInner {...props} />
    </Suspense>
  );
}
