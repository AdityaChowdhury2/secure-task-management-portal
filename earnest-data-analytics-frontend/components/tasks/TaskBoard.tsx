"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetTasksQuery,
  useToggleTaskMutation,
  useUpdateTaskMutation,
} from "@/redux/api";
import type { ApiTaskStatus, Task, TaskStatusFilter } from "@/types/task";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { RowActionsHelp } from "@/components/tasks/RowActionsHelp";
import { TaskBoardTutorial } from "@/components/tasks/TaskBoardTutorial";
import { TaskSegmentedPagination } from "@/components/tasks/TaskSegmentedPagination";
import { TaskSkeletonGrid } from "@/components/tasks/TaskSkeleton";
import { Button } from "@/components/ui/Button";
import { Input, Label, TextArea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { toast } from "react-toastify";
import { formatTaskDate } from "@/lib/format";

type CreateTaskFormValues = {
  title: string;
  description: string;
};

export function TaskBoard() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);
  const [filter, setFilter] = useState<TaskStatusFilter>("all");

  const {
    data: tasksData,
    isLoading,
    error,
  } = useGetTasksQuery({
    page,
    limit: pageSize,
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

  const createForm = useForm<CreateTaskFormValues>({
    defaultValues: { title: "", description: "" },
  });
  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreateForm,
    formState: { errors: createErrors },
  } = createForm;

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<ApiTaskStatus>("PENDING");

  const tasks = useMemo(() => tasksData?.items ?? [], [tasksData?.items]);
  const totalPages = tasksData?.meta?.totalPages ?? 1;
  const totalItems = tasksData?.meta?.totalItems ?? 0;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filter, pageSize]);

  function openAdd() {
    resetCreateForm({ title: "", description: "" });
    setAddOpen(true);
  }

  function closeAddModal() {
    resetCreateForm({ title: "", description: "" });
    setAddOpen(false);
  }

  function openEdit(task: Task) {
    setFormTitle(task.title);
    setFormDescription(task.description);
    setFormStatus(task.status);
    setEditTask(task);
  }

  async function onCreateValid(values: CreateTaskFormValues) {
    try {
      await createTask({
        title: values.title.trim(),
        description: values.description.trim(),
      }).unwrap();
      toast.success("Task created");
      resetCreateForm({ title: "", description: "" });
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
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-800 shadow-sm">
        Unable to load tasks. Check your connection and API URL.
      </div>
    );
  }

  return (
    <div className="mx-auto flex flex-col w-full">
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
              Workspace
            </h1>
            <p className="text-slate-500 text-sm max-w-xl">
              Organize your tasks efficiently. View, filter, and modify items using this modern paginated table layout.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              data-tutorial="new-task"
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
          </div>
        </div>

        <div
          data-tutorial="search-filter"
          className="relative z-10 mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 items-end"
        >
          <div className="min-w-0">
            <Label htmlFor="task-search" className="text-slate-500 mb-1.5 ml-1">Quick Search</Label>
            <Input
              id="task-search"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border-white/40 shadow-sm backdrop-blur-md"
            />
          </div>
          <div className="w-full">
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
        <TaskSkeletonGrid count={pageSize} />
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
                No tasks match your current criteria. Create a new task to get started.
              </p>
            </div>
          ) : (
            <div className="bg-slate-50/60 backdrop-blur-3xl border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white/50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200/60">
                    <tr>
                      <th scope="col" className="px-6 py-4">Status</th>
                      <th scope="col" className="px-6 py-4">Title</th>
                      <th scope="col" className="px-6 py-4 hidden md:table-cell">Description</th>
                      <th scope="col" className="px-6 py-4">Created Date</th>
                      <th
                        scope="col"
                        data-tutorial="row-actions"
                        className="px-6 py-4 text-right"
                      >
                        <span className="inline-flex items-center justify-end gap-1.5">
                          <span>Actions</span>
                          <RowActionsHelp />
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60">
                    {tasks.map((task) => {
                      const isDone = task.status === "COMPLETED";
                      const isInProgress = task.status === "IN_PROGRESS";
                      return (
                        <tr key={task.id} className="hover:bg-white/60 bg-white/40 transition-colors duration-200 group">
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                              ${isDone ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" :
                                isInProgress ? "bg-blue-50 text-blue-700 border-blue-200/60" :
                                  "bg-rose-50 text-rose-700 border-rose-200/60"}
                            `}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isDone ? "bg-emerald-500" : isInProgress ? "bg-blue-500" : "bg-rose-500"}`}></span>
                              {task.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className={`font-semibold text-[14px] truncate max-w-[200px] ${isDone ? "text-slate-400 line-through" : "text-slate-800"}`}>
                              {task.title}
                            </p>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <p className="text-slate-500 truncate max-w-[250px] lg:max-w-[400px]">
                              {task.description || "—"}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            {formatTaskDate(task.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleToggle(task.id)}
                                disabled={toggleBusyId === task.id}
                                className={`p-1.5 rounded-md hover:bg-slate-100 transition-colors ${isDone ? "text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50" : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"}`}
                                title={isDone ? "Mark Pending" : "Mark Done"}
                              >
                                {isDone ? (
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                              <button
                                onClick={() => openEdit(task)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                                title="Edit Task"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setDeleteTarget(task)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                                title="Delete Task"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-slate-200/60 bg-white/60 px-6 py-4">
                <div className="text-sm text-slate-500">
                  Showing page <span className="font-semibold text-slate-700">{page}</span> of <span className="font-semibold text-slate-700">{totalPages}</span>
                  {" "}({totalItems} total tasks)
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Items per page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="cursor-pointer rounded-lg border border-slate-200/60 bg-white px-2 py-1 text-sm text-slate-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-indigo-400"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                    </select>
                  </div>
                  <div className="max-w-full overflow-x-auto">
                    <TaskSegmentedPagination
                      page={page}
                      totalPages={Math.max(1, totalPages)}
                      onPageChange={setPage}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* NEW/EDIT MODALS */}
      <Modal
        open={addOpen}
        title="Create New Task"
        onClose={closeAddModal}
        footer={
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="secondary" type="button" className="flex-1 sm:flex-none" onClick={closeAddModal}>
              Discard
            </Button>
            <Button
              type="submit"
              form="create-task-form"
              className="flex-1 sm:flex-none bg-slate-900 border-none px-6"
              disabled={creating}
            >
              {creating ? "Creating..." : "Create Task"}
            </Button>
          </div>
        }
      >
        <form
          id="create-task-form"
          className="space-y-5 pt-2"
          onSubmit={handleCreateSubmit(onCreateValid)}
          noValidate
        >
          <div>
            <Label htmlFor="add-title" className="text-slate-600">
              Task Title
            </Label>
            <Input
              id="add-title"
              placeholder="e.g., Update marketing copy"
              className={`mt-1.5 ${createErrors.title ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
              aria-invalid={createErrors.title ? true : undefined}
              aria-describedby={createErrors.title ? "add-title-error" : undefined}
              {...registerCreate("title", {
                required: "Title is required",
                validate: (v) => (v?.trim() ? true : "Title is required"),
              })}
            />
            {createErrors.title && (
              <p id="add-title-error" className="mt-1.5 text-xs text-red-600" role="alert">
                {createErrors.title.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="add-desc" className="text-slate-600">
              Details (Optional)
            </Label>
            <TextArea
              id="add-desc"
              placeholder="Provide a little more context..."
              className="mt-1.5 h-28"
              {...registerCreate("description")}
            />
          </div>
        </form>
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

      <TaskBoardTutorial />
    </div>
  );
}
