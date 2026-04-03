"use client";

import type { Task } from "@/types/task";
import { formatTaskDate } from "@/lib/format";
import { cn } from "@/lib/utlils";

type Props = {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggle: (id: string) => void;
  toggling?: boolean;
};

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onToggle,
  toggling,
}: Props) {
  const done = task.status === "COMPLETED";

  return (
    <article className="group relative flex flex-col rounded-2xl border border-white/60 bg-white/40 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/60 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)]">
      <div className="absolute top-4 right-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100 flex gap-1 bg-white/80 backdrop-blur-md rounded-lg shadow-sm border border-slate-100 p-1">
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
          title="Edit Task"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(task)}
          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
          title="Delete Task"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="mb-4 pr-16 min-h-12">
        <h3
          className={cn(`text-[15px] font-semibold text-slate-800 leading-snug transition-all`, done ? "line-through text-slate-400" : ""
          )}
        >
          {task.title}
        </h3>
        {task.description && (
          <p className={`mt-2 text-sm leading-relaxed line-clamp-3 ${done ? "text-slate-400" : "text-slate-500"}`}>
            {task.description}
          </p>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-200/50">
        <label className="flex items-center gap-2.5 cursor-pointer group/label">
          <div className="relative flex items-center justify-center w-5 h-5">
            <input
              type="checkbox"
              checked={done}
              onChange={() => onToggle(task.id)}
              disabled={toggling}
              className="peer sr-only"
            />
            <div className="w-5 h-5 rounded-full border-2 border-slate-300 peer-checked:border-emerald-500 peer-checked:bg-emerald-500 transition-all duration-300 group-hover/label:border-emerald-400 shadow-inner group-active/label:scale-90" />
            <svg
              className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-all duration-300 scale-50 peer-checked:scale-100"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className={`text-xs font-medium transition-colors ${done ? "text-emerald-600" : "text-slate-500 group-hover/label:text-slate-700"}`}>
            {done ? "Completed" : "Mark done"}
          </span>
        </label>

        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-100/50 px-2.5 py-1 rounded-full border border-slate-200/50">
          {formatTaskDate(task.createdAt)}
        </span>
      </div>
    </article>
  );
}
