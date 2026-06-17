import { cn } from "@/lib/api";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-lg", className)} />;
}

export function SeriesCardSkeleton() {
  return (
    <div className="flex flex-col bg-bg-card border border-border rounded-xl overflow-hidden">
      <Skeleton className="aspect-[3/4] rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
    </div>
  );
}

export function SeriesGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SeriesCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="bg-bg-card border border-border/50 rounded-xl p-3.5 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="w-7 h-7 rounded-full" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}

export function RankItemSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <Skeleton className="w-6 h-5 rounded" />
      <Skeleton className="w-9 h-12 rounded" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-2.5 w-16" />
      </div>
    </div>
  );
}
