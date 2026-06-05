export function ShellSkeleton() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <div className="sticky top-0 z-50 bg-ink border-b-[5px] border-primary px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          <div className="skeleton h-10 w-36 border-2 border-white/40" />
          <div className="hidden flex-1 gap-2 sm:flex">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-8 w-24 border-2 border-white/30" />)}
          </div>
          <div className="skeleton h-9 w-20 border-2 border-white/30" />
        </div>
      </div>
      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <DashboardSkeleton />
      </main>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 border-2 border-ink shadow-brutal-sm" />)}
      </div>
      <div className="skeleton h-44 border-2 border-ink shadow-brutal-sm" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-52 border-2 border-ink shadow-brutal-sm" />)}
      </div>
    </div>
  );
}

export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="skeleton min-h-[260px] border-4 border-ink shadow-brutal-sm" />
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="grid gap-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="skeleton h-16 border-2 border-ink" />
      ))}
    </div>
  );
}
