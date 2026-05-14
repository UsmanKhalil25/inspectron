import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function ProjectDetailSkeleton() {
  return (
    <div className="flex flex-col bg-background">
      {/* Header skeleton */}
      <div className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <Skeleton className="h-7 w-7 rounded-md" />
        <Skeleton className="h-4 w-px" />
        <Skeleton className="h-3.5 w-3.5 rounded-sm" />
        <Skeleton className="h-4 w-32" />
        <div className="flex-1" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* Info card skeleton */}
        <Card className="rounded-2xl shadow-sm border">
          <CardHeader className="pb-2 px-5 pt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-20 mt-1 rounded-full" />
                </div>
              </div>
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
          </CardHeader>
          <CardContent className="space-y-5 px-5 pb-5">
            <div>
              <Skeleton className="h-3 w-8 mb-1.5" />
              <Skeleton className="h-5 w-72" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Scans section skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export { ProjectDetailSkeleton };
