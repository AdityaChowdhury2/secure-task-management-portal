"use client";

import { useEffect, useMemo, useState } from "react";
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
import { toast } from "react-toastify";
import { TaskCard } from "@/components/tasks/TaskCard";

const PAGE_SIZE = 50;

const BOARD_COLUMNS = [
  {
    id: "PENDING" as ApiTaskStatus,
    label: "To Do",
    dot: "bg-rose-500",
    headerGrad: "from-rose-500/10 to-orange-500/10",
    border: "border-rose-200/50",
  },
  {
    id: "IN_PROGRESS" as ApiTaskStatus,
    label: "In Progress",
    dot: "bg-blue-500",
    headerGrad: "from-blue-500/10 to-indigo-500/10",
    border: "border-blue-200/50",
  },
  {
    id: "COMPLETED" as ApiTaskStatus,
    label: "Done",
    dot: "bg-emerald-500",
    headerGrad: "from-emerald-500/10 to-teal-500/10",
    border: "border-emerald-200/50",
  },
];

export function TaskBoard() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);
  const [filter, setFilter] = useState<TaskStatusFilter>("all");

  const {
    data: tasksData,
    isLoading,
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

  // const [seeding, setSeeding] = useState(false);

  const tasks = useMemo(() => tasksData?.items ?? [], [tasksData?.items]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filter]);

  const tasksByStatus = useMemo(() => {
    return tasks.reduce((acc, task) => {
      acc[task.status] = acc[task.status] ? [...acc[task.status], task] : [task];
      return acc;
    }, {} as Record<ApiTaskStatus, Task[]>);
  }, [tasks]);

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

  // async function seedDummyTasks() {
  //   setSeeding(true);
  //   const dummyTasks = Array.from({ length: 20 }).map((_, i) => {
  //     const statuses: ApiTaskStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED"];
  //     return {
  //       title: `Dashboard Redesign Feature pt.${i + 1}`,
  //       description: `Implement the modern UI components for the redesigned task board module. Ensure everything is responsive, animated, and looks absolutely gorgeous for phase ${i + 1}.`,
  //       status: statuses[Math.floor(Math.random() * statuses.length)],
  //     };
  //   });

  //   try {
  //     for (const t of dummyTasks) {
  //       const res = await createTask({ title: t.title, description: t.description }).unwrap();
  //       if (t.status !== "PENDING") {
  //         await updateTask({ id: res.id, title: res.title, description: res.description, status: t.status }).unwrap();
  //       }
  //     }
  //     toast.success("Successfully generated 20 dummy tasks!");
  //   } catch {
  //     toast.error("Failed to generate some dummy tasks.");
  //   } finally {
  //     setSeeding(false);
  //   }
  // }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-800 shadow-sm">
        Unable to load tasks. Check your connection and API URL.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-350">
      <div className="relative mb-10 overflow-hidden rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
              Workspace
            </h1>
            <p className="text-slate-500 text-sm max-w-xl">
              Organize your tasks visually. Add, move, and complete your tasks seamlessly via this modern board layout.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              className="rounded-xl shadow-lg hover:shadow-indigo-500/20 px-5 transition-all bg-slate-900 border-0"
              onClick={openAdd}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Task
              </span>
            </Button>
            {/* <Button
              onClick={seedDummyTasks}
              disabled={seeding}
              className="rounded-xl border-0 bg-linear-to-r! from-indigo-500! via-purple-500! to-pink-500! hover:from-indigo-600! hover:to-pink-600! text-white shadow-lg hover:shadow-purple-500/30 px-5 transition-all"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                {seeding ? "Generating..." : "Gen 20 Tasks"}
              </span>
            </Button> */}
          </div>
        </div>

        <div className="relative z-10 mt-8 flex flex-col gap-4 sm:flex-row sm:items-end bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
          <div className="min-w-0 flex-1">
            <Label htmlFor="task-search" className="text-slate-500 mb-1.5 ml-1">Quick Search</Label>
            <Input
              id="task-search"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border-white/40 shadow-sm backdrop-blur-md"
            />
          </div>
          <div className="w-full sm:w-64">
            <Label htmlFor="task-status-filter" className="text-slate-500 mb-1.5 ml-1">Filter View</Label>
            <select
              id="task-status-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value as TaskStatusFilter)}
              className="w-full cursor-pointer rounded-xl border border-white/40 bg-white px-4 py-2.75 text-sm text-slate-800 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 backdrop-blur-md"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending Only</option>
              <option value="IN_PROGRESS">In Progress Only</option>
              <option value="COMPLETED">Completed Only</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <TaskSkeletonGrid />
      ) : (
        <>
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/50 backdrop-blur-sm py-24 text-center shadow-sm">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 text-indigo-500">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">No tasks found</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                No tasks match your current criteria. Create a new task or generate dummy data to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start pb-8">
              {BOARD_COLUMNS.map((col) => {
                if (filter !== "all" && filter !== col.id) return null;
                const colTasks = tasksByStatus[col.id] || [];
                return (
                  <div key={col.id} className="flex flex-col rounded-3xl bg-slate-50/60 backdrop-blur-3xl border border-slate-200/60 p-2 shadow-sm min-h-125">
                    <div className={`rounded-2xl bg-linear-to-br ${col.headerGrad} p-4 mb-3 border border-white/50 backdrop-blur-md`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full ${col.dot} shadow-sm`} />
                          <h2 className="font-semibold text-slate-800">{col.label}</h2>
                        </div>
                        <span className="text-xs font-bold text-slate-500 bg-white/60 px-2 py-0.5 rounded-full border border-slate-200/50">
                          {colTasks.length}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 px-1.5 pb-2">
                      {colTasks.length > 0 ? (
                        colTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={openEdit}
                            onDelete={setDeleteTarget}
                            onToggle={handleToggle}
                            toggling={toggleBusyId === task.id}
                          />
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-24 border-2 border-dashed border-slate-200/80 rounded-2xl bg-slate-50/50">
                          <p className="text-sm text-slate-400 font-medium">Drop tasks here</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* NEW/EDIT MODALS */}
      <Modal
        open={addOpen}
        title="Create New Task"
        onClose={() => setAddOpen(false)}
        footer={
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="secondary" className="flex-1 sm:flex-none" onClick={() => setAddOpen(false)}>
              Discard
            </Button>
            <Button className="flex-1 sm:flex-none bg-slate-900 border-none px-6" onClick={submitCreate} disabled={creating}>
              {creating ? "Creating..." : "Create Task"}
            </Button>
          </div>
        }
      >
        <div className="space-y-5 pt-2">
          <div>
            <Label htmlFor="add-title" className="text-slate-600">Task Title</Label>
            <Input
              id="add-title"
              placeholder="e.g., Update marketing copy"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="add-desc" className="text-slate-600">Details (Optional)</Label>
            <TextArea
              id="add-desc"
              placeholder="Provide a little more context..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="mt-1.5 h-28"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={!!editTask}
        title="Edit Task Details"
        onClose={() => setEditTask(null)}
        footer={
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="secondary" className="flex-1 sm:flex-none" onClick={() => setEditTask(null)}>
              Cancel
            </Button>
            <Button className="flex-1 sm:flex-none bg-indigo-600 border-none px-6 hover:bg-indigo-700" onClick={submitEdit} disabled={updating}>
              {updating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        }
      >
        <div className="space-y-5 pt-2">
          <div>
            <Label htmlFor="edit-title" className="text-slate-600">Task Title</Label>
            <Input
              id="edit-title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="edit-desc" className="text-slate-600">Details</Label>
            <TextArea
              id="edit-desc"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="mt-1.5 h-28"
            />
          </div>
          <div>
            <Label className="text-slate-600">Current Phase</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {(["PENDING", "IN_PROGRESS", "COMPLETED"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormStatus(s)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${formStatus === s
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-500/20"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                >
                  {s === "PENDING" ? "To Do" : s === "IN_PROGRESS" ? "In Progress" : "Completed"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Confirm Deletion"
        onClose={() => setDeleteTarget(null)}
        footer={
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="secondary" className="flex-1 sm:flex-none" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1 sm:flex-none px-6"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </Button>
          </div>
        }
      >
        <p className="text-slate-600">
          Are you sure you want to delete <strong className="text-slate-900 font-semibold">{deleteTarget?.title}</strong>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
