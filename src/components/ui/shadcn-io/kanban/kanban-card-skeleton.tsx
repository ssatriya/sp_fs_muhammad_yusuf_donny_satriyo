import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const KanbanCardSkeleton = () => {
  return (
    <Card className="rounded-md p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        </div>
        <Skeleton className="h-6 w-6 rounded-full shrink-0" />
      </div>
      <Skeleton className="h-3 w-16 mt-1" />
    </Card>
  );
};

export default KanbanCardSkeleton;
