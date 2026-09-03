export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-100 ${className}`} />;
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`card p-5 space-y-3 ${className}`}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <SkeletonCard className="h-20" />
        <SkeletonCard className="h-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonCard className="h-40" />
          <SkeletonCard className="h-40" />
        </div>
        <SkeletonCard className="h-32" />
      </div>
      <div className="space-y-6">
        <SkeletonCard className="h-64" />
      </div>
    </div>
  );
}

export function SkeletonProjectGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-2 w-full rounded-full mt-2" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonProjectDetail() {
  return (
    <div className="space-y-6">
      <div className="card-static p-6 space-y-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <SkeletonCard className="h-40" />
          <SkeletonCard className="h-56" />
        </div>
        <div className="space-y-6">
          <SkeletonCard className="h-40" />
          <SkeletonCard className="h-32" />
        </div>
      </div>
    </div>
  );
}
