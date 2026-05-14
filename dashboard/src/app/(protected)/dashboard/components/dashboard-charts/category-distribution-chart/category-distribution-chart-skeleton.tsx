import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function CategoryDistributionChartSkeleton() {
  return (
    <Card className="rounded-2xl shadow-sm border h-full flex flex-col">
      <CardHeader className="pb-2 px-5 pt-5">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-40 mt-2" />
      </CardHeader>
      <CardContent className="flex-1 px-2 pt-4 pb-2 sm:px-4 sm:pb-4">
        <Skeleton className="h-[250px] w-full" />
      </CardContent>
    </Card>
  );
}

export { CategoryDistributionChartSkeleton };
