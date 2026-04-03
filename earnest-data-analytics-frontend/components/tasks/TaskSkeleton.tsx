export function TaskSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
        >
          <div className="mb-3 h-4 w-2/3 rounded bg-slate-200" />
          <div className="mb-2 h-3 w-full rounded bg-slate-100" />
          <div className="mb-4 h-3 w-5/6 rounded bg-slate-100" />
          <div className="flex justify-between">
            <div className="h-6 w-20 rounded-full bg-slate-100" />
            <div className="h-8 w-24 rounded-lg bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
