import { Skeleton } from "@/components/ui/skeleton";

export function ScanDetailSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background">
      {/* Header Skeleton */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-zinc-800 bg-zinc-950 px-4">
        <Skeleton className="h-7 w-7 rounded" />
        <div className="h-4 w-px bg-zinc-800" />
        <Skeleton className="h-3.5 w-3.5 rounded-full" />
        <Skeleton className="h-3.5 w-48" />
        <Skeleton className="h-3 w-16" />
        <div className="flex-1" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-7 w-7 rounded" />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Browser Preview Skeleton */}
        <div className="flex flex-1 flex-col border-r overflow-hidden">
          <div className="flex h-10 shrink-0 items-center justify-between border-b bg-muted/30 px-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-1/2 rounded-sm" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
          <div className="relative flex flex-1 flex-col items-center justify-center">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="mt-3 h-4 w-48" />
            <Skeleton className="mt-1 h-3 w-64" />
          </div>
        </div>

        {/* Agent Activity Skeleton */}
        <div className="flex min-h-0 w-[360px] shrink-0 flex-col overflow-hidden xl:w-[420px]">
          <div className="flex h-10 shrink-0 items-center justify-between border-b bg-muted/30 px-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="min-h-0 flex-1 overflow-hidden p-4">
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
                <Skeleton className="h-16 w-full" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
                <Skeleton className="h-16 w-full" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
