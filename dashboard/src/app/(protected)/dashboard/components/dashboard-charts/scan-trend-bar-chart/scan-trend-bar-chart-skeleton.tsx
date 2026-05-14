import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ScanTrendBarChartSkeleton() {
  return (
    <Card className="rounded-2xl shadow-sm border overflow-hidden">
      <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-2 px-6 pt-5 pb-4 sm:py-5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="flex border-t sm:border-t-0 sm:border-l divide-x">
          <div className="flex flex-1 flex-col justify-center gap-2 px-5 py-4">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-7 w-16" />
          </div>
          <div className="flex flex-1 flex-col justify-center gap-2 px-5 py-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-16" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-6 pb-2 sm:px-6 sm:pb-4">
        <Skeleton className="h-[280px] w-full" />
      </CardContent>
    </Card>
  );
}

export { ScanTrendBarChartSkeleton };
