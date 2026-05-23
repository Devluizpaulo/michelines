import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200/80", className)}
      {...props}
    />
  )
}

/**
 * Shimmer: Elegant gradient shimmer effect for skeletons
 */
export function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent",
        className
      )}
    />
  )
}

/**
 * TableSkeleton: Shimmering placeholder rows representing high density layout table.
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4 w-full">
      {/* Header bar placeholder */}
      <div className="flex items-center gap-4 bg-slate-50 p-4 border border-slate-200 rounded-t-xl">
        <Skeleton className="h-5 w-8 rounded" />
        <Skeleton className="h-5 w-40 rounded" />
        <Skeleton className="h-5 w-24 rounded" />
        <Skeleton className="h-5 w-32 rounded ml-auto" />
      </div>
      {/* Rows */}
      <div className="border border-t-0 border-slate-200 rounded-b-xl divide-y divide-slate-100 overflow-hidden bg-white">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-5 relative overflow-hidden">
            <Shimmer />
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/3 rounded" />
              <Skeleton className="h-3 w-1/4 rounded" />
            </div>
            <Skeleton className="h-6 w-20 rounded" />
            <Skeleton className="h-6 w-24 rounded" />
            <Skeleton className="h-8 w-8 rounded-full ml-auto shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * KanbanSkeleton: Column layout placeholders for CRM Pipeline.
 */
export function KanbanSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 w-full h-[600px]">
      {Array.from({ length: 5 }).map((_, colIndex) => (
        <div key={colIndex} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col space-y-4 h-full relative overflow-hidden">
          <Shimmer />
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24 rounded" />
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>
          <div className="flex-1 space-y-3">
            {Array.from({ length: 3 }).map((_, cardIndex) => (
              <div key={cardIndex} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-12 rounded" />
                  <Skeleton className="h-3 w-8 rounded-full ml-auto" />
                </div>
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-3 w-2/3 rounded" />
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <Skeleton className="h-4 w-16 rounded" />
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * DashboardSkeleton: High-level overview layouts with top metric cards.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8 w-full">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 relative overflow-hidden">
            <Shimmer />
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-8 w-24 rounded" />
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <Skeleton className="h-3 w-8 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
          </div>
        ))}
      </div>
      {/* Big Chart and list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 h-80 space-y-4 relative overflow-hidden">
          <Shimmer />
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-32 rounded" />
            <Skeleton className="h-8 w-24 rounded" />
          </div>
          <Skeleton className="h-full w-full rounded" />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 h-80 space-y-4 relative overflow-hidden">
          <Shimmer />
          <Skeleton className="h-5 w-24 rounded" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export { Skeleton }
