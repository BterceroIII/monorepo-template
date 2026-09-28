import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PostCardSkeleton() {
  return (
    <Card className="w-full max-w-md gap-0 overflow-hidden py-0 shadow-sm">
      <CardHeader className="flex flex-row items-center gap-3 border-b p-4">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <Skeleton className="aspect-square w-full rounded-none" />
      <CardContent className="space-y-3 p-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  );
}
