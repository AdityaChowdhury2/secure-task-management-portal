"use client";

/** Sorted unique page numbers with ellipsis where there are gaps. */
function buildPageList(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages < 1) return [];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);

  if (currentPage <= 4) {
    for (let i = 1; i <= 4; i++) pages.add(i);
    for (let i = totalPages - 3; i <= totalPages; i++) pages.add(i);
  } else if (currentPage >= totalPages - 3) {
    for (let i = 1; i <= 4; i++) pages.add(i);
    for (let i = totalPages - 3; i <= totalPages; i++) pages.add(i);
  } else {
    for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.add(i);
    pages.add(1);
    pages.add(2);
    pages.add(totalPages - 1);
    pages.add(totalPages);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const out: Array<number | "ellipsis"> = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i]! - sorted[i - 1]! > 1) {
      out.push("ellipsis");
    }
    out.push(sorted[i]!);
  }
  return out;
}

function CircleChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M13.5 9.25L10.25 12.5l3.25 3.25"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CircleChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M10.5 9.25L13.75 12.5l-3.25 3.25"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const segmentDivider = "border-r border-slate-200/90";
const segmentBase =
  "inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center px-3 text-sm font-medium transition-colors";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function TaskSegmentedPagination({ page, totalPages, onPageChange }: Props) {
  const last = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, page), last);
  const pageItems = buildPageList(safePage, last);

  const canPrev = safePage > 1;
  const canNext = safePage < last;

  return (
    <nav
      className="inline-flex overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm"
      aria-label="Pagination"
    >
      <button
        type="button"
        disabled={!canPrev}
        onClick={() => canPrev && onPageChange(safePage - 1)}
        className={`${segmentBase} ${segmentDivider} gap-2 pl-4 pr-3 text-indigo-950 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40`}
      >
        <CircleChevronLeft className="h-4 w-4 shrink-0 text-indigo-950" />
        <span>Previous</span>
      </button>

      {pageItems.map((item, idx) =>
        item === "ellipsis" ? (
          <span
            key={`e-${idx}`}
            className={`${segmentBase} ${segmentDivider} cursor-default text-slate-500 select-none`}
            aria-hidden
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={`${segmentBase} ${segmentDivider} min-w-10 ${
              item === safePage
                ? "bg-indigo-50 text-indigo-950"
                : "text-slate-800 hover:bg-slate-50"
            }`}
            aria-label={`Page ${item}`}
            aria-current={item === safePage ? "page" : undefined}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        disabled={!canNext}
        onClick={() => canNext && onPageChange(safePage + 1)}
        className={`${segmentBase} gap-2 pl-3 pr-4 text-indigo-950 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40`}
      >
        <span>Next</span>
        <CircleChevronRight className="h-4 w-4 shrink-0 text-indigo-950" />
      </button>
    </nav>
  );
}
