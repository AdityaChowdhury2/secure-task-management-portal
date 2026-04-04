export function TaskSkeletonGrid({ count = 5 }: { count?: number }) {
  return (
    <div className="bg-white/50 backdrop-blur-3xl border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden mb-8 animate-pulse">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-4"><div className="h-3 w-16 bg-slate-200 rounded"></div></th>
              <th className="px-6 py-4"><div className="h-3 w-32 bg-slate-200 rounded"></div></th>
              <th className="px-6 py-4 hidden md:table-cell"><div className="h-3 w-48 bg-slate-200 rounded"></div></th>
              <th className="px-6 py-4"><div className="h-3 w-20 bg-slate-200 rounded"></div></th>
              <th className="px-6 py-4 text-right"><div className="h-3 w-16 bg-slate-200 rounded ml-auto"></div></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/60 bg-white">
            {Array.from({ length: count }).map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-5"><div className="h-5 w-20 bg-slate-200 rounded-full"></div></td>
                <td className="px-6 py-5"><div className="h-4 w-3/4 bg-slate-200 rounded"></div></td>
                <td className="px-6 py-5 hidden md:table-cell">
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-slate-100 rounded"></div>
                    <div className="h-3 w-5/6 bg-slate-100 rounded"></div>
                  </div>
                </td>
                <td className="px-6 py-5"><div className="h-4 w-24 bg-slate-200 rounded"></div></td>
                <td className="px-6 py-5 text-right flex justify-end gap-2">
                   <div className="h-8 w-8 bg-slate-200 rounded-md"></div>
                   <div className="h-8 w-8 bg-slate-200 rounded-md"></div>
                   <div className="h-8 w-8 bg-slate-200 rounded-md"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
