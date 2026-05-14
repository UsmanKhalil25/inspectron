import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ProjectVulnerabilitiesBarChartSkeleton() {
  return (
    <Card className="rounded-2xl shadow-sm border overflow-hidden">
      <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-2 px-6 pt-5 pb-4 sm:py-5">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex border-t sm:border-t-0 sm:border-l divide-x overflow-x-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="relative z-30 flex flex-1 flex-col justify-center gap-1 px-4 py-4 min-w-[72px]"
            >
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-7 w-8 sm:h-8 sm:w-12" />
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-6 pb-2 sm:px-6 sm:pb-4">
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}

export { ProjectVulnerabilitiesBarChartSkeleton };
