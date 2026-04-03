"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetTasksQuery,
  useToggleTaskMutation,
  useUpdateTaskMutation,
} from "@/redux/api";
import type { ApiTaskStatus, Task, TaskStatusFilter } from "@/types/task";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { TaskSkeletonGrid } from "@/components/tasks/TaskSkeleton";
import { Button } from "@/components/ui/Button";
import { Input, Label, TextArea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatTaskDate } from "@/lib/format";
import { toast } from "react-toastify";

const PAGE_SIZE = 10;
const columnHelper = createColumnHelper<Task>();

const statusOptions: Array<{ value: TaskStatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
];

function statusBadgeClass(status: ApiTaskStatus): string {
  if (status === "COMPLETED") return "bg-emerald-50 text-emerald-800";
  if (status === "IN_PROGRESS") return "bg-blue-50 text-blue-800";
  return "bg-amber-50 text-amber-800";
}

export function TaskBoard() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);
  const [filter, setFilter] = useState<TaskStatusFilter>("all");

  const {
    data: tasksData,
    isLoading,
    isFetching,
    error,
  } = useGetTasksQuery({
    page,
    limit: PAGE_SIZE,
    status: filter === "all" ? undefined : filter,
    search: debouncedSearch,
  });
  const [createTask, { isLoading: creating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: updating }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();
  const [toggleTask] = useToggleTaskMutation();

  const [addOpen, setAddOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [toggleBusyId, setToggleBusyId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<ApiTaskStatus>("PENDING");

  const tasks = tasksData?.items ?? [];
  const totalPages = tasksData?.totalPages ?? 1;
  const totalItems = tasksData?.totalItems ?? 0;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: "Title",
        cell: (info) => (
          <div className="min-w-[180px]">
            <p className="font-medium text-slate-900">{info.getValue()}</p>
            <p className="line-clamp-2 text-xs text-slate-500">
              {info.row.original.description || "—"}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(
              info.getValue(),
            )}`}
          >
            {info.getValue().replace("_", " ")}
          </span>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Created",
        cell: (info) => (
          <span className="text-sm text-slate-500">
            {formatTaskDate(info.getValue())}
          </span>
        ),
      }),
      columnHelper.display({
        id: "toggle",
        header: "Toggle",
        cell: (info) => {
          const task = info.row.original;
          const checked = task.status === "COMPLETED";
          return (
            <input
              type="checkbox"
              checked={checked}
              onChange={() => handleToggle(task.id)}
              disabled={toggleBusyId === task.id}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
              aria-label={checked ? "Mark pending" : "Mark completed"}
            />
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => {
          const task = info.row.original;
          return (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="rounded-lg px-3 py-1.5 text-xs"
                onClick={() => openEdit(task)}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                className="rounded-lg px-3 py-1.5 text-xs"
                onClick={() => setDeleteTarget(task)}
              >
                Delete
              </Button>
            </div>
          );
        },
      }),
    ],
    [toggleBusyId],
  );

  const table = useReactTable({
    data: tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  function openAdd() {
    setFormTitle("");
    setFormDescription("");
    setFormStatus("PENDING");
    setAddOpen(true);
  }

  function openEdit(task: Task) {
    setFormTitle(task.title);
    setFormDescription(task.description);
    setFormStatus(task.status);
    setEditTask(task);
  }

  async function submitCreate() {
    if (!formTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    try {
      await createTask({
        title: formTitle.trim(),
        description: formDescription.trim(),
      }).unwrap();
      toast.success("Task created");
      setAddOpen(false);
    } catch {
      toast.error("Could not create task");
    }
  }

  async function submitEdit() {
    if (!editTask) return;
    if (!formTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    try {
      await updateTask({
        id: editTask.id,
        title: formTitle.trim(),
        description: formDescription.trim(),
        status: formStatus,
      }).unwrap();
      toast.success("Task updated");
      setEditTask(null);
    } catch {
      toast.error("Could not update task");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteTask(deleteTarget.id).unwrap();
      toast.success("Task deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Could not delete task");
    }
  }

  async function handleToggle(id: string) {
    setToggleBusyId(id);
    try {
      await toggleTask(id).unwrap();
    } catch {
      toast.error("Could not update status");
    } finally {
      setToggleBusyId(null);
    }
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-800">
        Unable to load tasks. Check your connection and API URL.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Search, filter, and manage your work.
          </p>
        </div>
        <Button
          className="w-full shrink-0 rounded-xl sm:w-auto"
          onClick={openAdd}
        >
          Add task
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <Label htmlFor="task-search">Search</Label>
          <Input
            id="task-search"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:min-w-[200px] sm:w-56">
          <Label htmlFor="task-status-filter">Status</Label>
          <select
            id="task-status-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as TaskStatusFilter)}
            className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            aria-label="Filter by status"
          >
            {statusOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <TaskSkeletonGrid />
      ) : (
        <>
          {isFetching && !isLoading ? (
            <p className="mb-3 text-xs text-slate-400">Refreshing…</p>
          ) : null}
          {tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-500 shadow-sm">
              No tasks match your filters.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/80">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-4 py-3 align-top">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing {(page - 1) * PAGE_SIZE + 1}-
                  {Math.min(page * PAGE_SIZE, totalItems)} of {totalItems}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    className="rounded-lg px-3 py-1.5 text-sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-slate-600">
                    Page {page} / {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    className="rounded-lg px-3 py-1.5 text-sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        open={addOpen}
        title="New task"
        onClose={() => setAddOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitCreate} disabled={creating}>
              {creating ? "Saving…" : "Create"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="add-title">Title</Label>
            <Input
              id="add-title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="add-desc">Description</Label>
            <TextArea
              id="add-desc"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={!!editTask}
        title="Edit task"
        onClose={() => setEditTask(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditTask(null)}>
              Cancel
            </Button>
            <Button onClick={submitEdit} disabled={updating}>
              {updating ? "Saving…" : "Save"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="edit-desc">Description</Label>
            <TextArea
              id="edit-desc"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>
          <div>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Status
            </span>
            <div className="flex gap-2">
              {(["PENDING", "IN_PROGRESS", "COMPLETED"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormStatus(s)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                    formStatus === s
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Delete task?"
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          This will remove{" "}
          <span className="font-semibold text-slate-900">
            {deleteTarget?.title}
          </span>
          . This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
