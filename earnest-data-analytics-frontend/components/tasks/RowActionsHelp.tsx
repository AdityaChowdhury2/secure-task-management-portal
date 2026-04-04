"use client";

export function RowActionsHelp() {
  return (
    <div className="group/help relative inline-flex shrink-0">
      <button
        type="button"
        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1"
        aria-label="What these action buttons do"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
      <div
        role="tooltip"
        className="invisible opacity-0 group-hover/help:visible group-hover/help:opacity-100 group-focus-within/help:visible group-focus-within/help:opacity-100 transition-opacity duration-150 absolute right-full top-1 z-100 mr-2 w-xl  whitespace-normal rounded-xl border border-slate-200 bg-white p-3 text-left text-xs text-slate-600 shadow-lg"
      >
        <p className="font-semibold text-slate-800 mb-2">Actions column</p>
        <ul className="space-y-2 list-none m-0 p-0">
          <li>
            <span className="font-medium text-slate-700">Check / X</span>
            {" — "}
            <span className="normal-case">Toggle between not done and completed (same as marking the task done).</span>
          </li>
          <li>
            <span className="font-medium text-slate-700">Pencil</span>
            {" — "}
            <span className="normal-case">Edit title, details, or status (Pending, In Progress, Completed).</span>
          </li>
          <li>
            <span className="font-medium text-slate-700">Trash</span>
            {" — "}
            <span className="normal-case">Delete the task after you confirm in the dialog.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
