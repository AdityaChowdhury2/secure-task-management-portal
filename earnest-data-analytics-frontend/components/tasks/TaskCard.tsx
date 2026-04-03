"use client";

import type { Task } from "@/types/task";
import { formatTaskDate } from "@/lib/format";
import { Button } from "@/components/ui/Button";

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
    <article className="flex flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start gap-3">
        <input
          type="checkbox"
          checked={done}
          onChange={() => onToggle(task.id)}
          disabled={toggling}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
          aria-label={done ? "Mark pending" : "Mark completed"}
        />
        <div className="min-w-0 flex-1">
          <h3
            className={`text-base font-semibold text-slate-900 ${
              done ? "line-through opacity-60" : ""
            }`}
          >
            {task.title}
          </h3>
          <p className="mt-1 text-sm text-slate-600 line-clamp-3">
            {task.description || "—"}
          </p>
        </div>
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-50 pt-3">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            done
              ? "bg-emerald-50 text-emerald-800"
              : "bg-amber-50 text-amber-800"
          }`}
        >
          {done ? "Completed" : "Pending"}
        </span>
        <span className="text-xs text-slate-400">
          {formatTaskDate(task.createdAt)}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="secondary"
          className="flex-1 rounded-xl py-2 text-xs sm:flex-none"
          onClick={() => onEdit(task)}
        >
          Edit
        </Button>
        <Button
          variant="danger"
          className="flex-1 rounded-xl py-2 text-xs sm:flex-none"
          onClick={() => onDelete(task)}
        >
          Delete
        </Button>
      </div>
    </article>
  );
}
