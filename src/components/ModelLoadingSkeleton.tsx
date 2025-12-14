import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function TextModelSkeleton() {
  return (
    <Card className="shadow-lg border-2">
      <CardContent className="pt-4 md:pt-6 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-10 w-full md:w-[280px]" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

export function TextChatSkeleton() {
  return (
    <Card className="min-h-[450px] md:min-h-[550px] flex flex-col shadow-lg border-2">
      <div className="flex-1 p-3 md:p-6">
        <div className="flex flex-col items-center justify-center py-12 md:py-16 px-4">
          <Skeleton className="w-14 h-14 md:w-16 md:h-16 rounded-full mb-3 md:mb-4" />
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="p-3 md:p-4 border-t bg-background/50">
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-12 md:h-16" />
          <Skeleton className="h-12 w-12" />
        </div>
      </div>
    </Card>
  );
}

export function ImageGeneratorSkeleton() {
  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <Card className="shadow-lg border-2">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-8 w-40" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="flex-1 h-10" />
            <Skeleton className="h-10 w-12" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ModelSelectSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full md:w-[280px]" />
    </div>
  );
}
