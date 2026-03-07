"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

import { Skeleton } from "./skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function SortByFilterFallback() {
  return (
    <Button
      variant="ghost"
      disabled
      className="h-10 px-4 rounded-none border-0 bg-transparent"
    >
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-sm" />

        <Skeleton className="h-4 w-[100px]" />
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>
    </Button>
  );
}

interface SortOption {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SortByFilterProps {
  options: SortOption[];
  paramKey: string;
  label?: string;
  className?: string;
}

function SortByFilterInner({
  options,
  paramKey = "sortBy",
  label = "Sort by",
  className,
}: SortByFilterProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentValue = searchParams.get(paramKey) || options[0]?.value;
  const currentOption =
    options.find((option) => option.value === currentValue) || options[0];

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(paramKey, value);
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-10 px-4 rounded-none border-0 bg-transparent hover:bg-background/80",
            className,
          )}
          aria-label={`Sort by ${currentOption.label}`}
        >
          <div className="flex items-center gap-2">
            <currentOption.icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium w-[100px] truncate">
              {currentOption.label}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="start">
        <div className="space-y-1">
          {label && (
            <>
              <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                {label}
              </div>
              <Separator />
            </>
          )}
          {options.map(({ value, label, icon: Icon }) => {
            const isSelected = currentValue === value;
            return (
              <Button
                key={value}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-9 px-2",
                  isSelected && "bg-accent text-accent-foreground",
                )}
                onClick={() => handleChange(value)}
                aria-selected={isSelected}
              >
                <Icon className="h-4 w-4 mr-3 text-muted-foreground" />
                <span className="text-sm">{label}</span>
                {isSelected && <Check className="ml-auto h-3 w-3" />}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function SortByFilter(props: SortByFilterProps) {
  return (
    <Suspense fallback={<SortByFilterFallback />}>
      <SortByFilterInner {...props} />
    </Suspense>
  );
}
