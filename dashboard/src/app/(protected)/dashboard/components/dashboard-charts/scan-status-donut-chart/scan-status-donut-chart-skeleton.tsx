import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ScanStatusDonutChartSkeleton() {
  return (
    <Card className="rounded-2xl shadow-sm border h-full flex flex-col">
      <CardHeader className="pb-2 px-5 pt-5 items-center">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-28 mt-2" />
      </CardHeader>
      <CardContent className="flex-1 px-2 pt-4 pb-2 sm:px-4 sm:pb-4 flex flex-col justify-center">
        <Skeleton className="mx-auto h-[220px] w-[220px] rounded-full" />
        <Skeleton className="h-4 w-24 mx-auto mt-4" />
      </CardContent>
    </Card>
  );
}

export { ScanStatusDonutChartSkeleton };
