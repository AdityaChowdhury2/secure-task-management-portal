export type ApiTaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";
export type TaskStatusFilter = "all" | ApiTaskStatus;

export type Task = {
  id: string;
  title: string;
  description: string;
  status: ApiTaskStatus;
  createdAt: string;
};

export type GetTasksQueryParams = {
  page: number;
  limit: number;
  status?: ApiTaskStatus;
  search?: string;
};

type Meta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

export type PaginatedTasksResponse = {
  items: Task[];
  meta: Meta;
};

export type CreateTaskRequest = {
  title: string;
  description: string;
};

export type UpdateTaskRequest = {
  id: string;
  title: string;
  description: string;
  status: ApiTaskStatus;
};
