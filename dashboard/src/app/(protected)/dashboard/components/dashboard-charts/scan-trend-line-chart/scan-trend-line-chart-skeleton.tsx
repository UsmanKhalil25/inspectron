import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ScanTrendLineChartSkeleton() {
  return (
    <Card className="rounded-2xl shadow-sm py-0">
      <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-64 mt-1" />
        </div>
        <div className="flex">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-4 py-3 even:border-l sm:border-t-0 sm:border-l sm:px-6 sm:py-4"
            >
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-7 w-16 sm:h-8 sm:w-20" />
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <Skeleton className="aspect-auto h-[250px] w-full" />
      </CardContent>
    </Card>
  );
}

export { ScanTrendLineChartSkeleton };
