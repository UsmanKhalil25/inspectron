"use client";

import { Suspense } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const QUERY_SEARCH_DEBOUNCE_MS = 300;

interface QuerySearchFallbackProps {
  placeholder: string;
}

function QuerySearchFallback({ placeholder }: QuerySearchFallbackProps) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        disabled
        className="pl-10 h-10 bg-background border-border"
      />
    </div>
  );
}

interface QuerySearchInputProps {
  placeholder: string;
  paramName?: string;
}

function QuerySearchInput({
  placeholder,
  paramName = "query",
}: QuerySearchInputProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const currentQueryValue = searchParams.get(paramName) || "";

  const updateQueryParam = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");

    if (value) {
      params.set(paramName, value);
    } else {
      params.delete(paramName);
    }

    replace(`${pathname}?${params.toString()}`);
  }, QUERY_SEARCH_DEBOUNCE_MS);

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        onChange={(e) => updateQueryParam(e.target.value)}
        defaultValue={currentQueryValue}
        className="pl-10 h-10 bg-background border-border focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

interface QuerySearchProps {
  placeholder?: string;
  paramName?: string;
}

export function QuerySearch({
  placeholder = "Search...",
  paramName = "query",
}: QuerySearchProps = {}) {
  return (
    <Suspense fallback={<QuerySearchFallback placeholder={placeholder} />}>
      <QuerySearchInput placeholder={placeholder} paramName={paramName} />
    </Suspense>
  );
}
