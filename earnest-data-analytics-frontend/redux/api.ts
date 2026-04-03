import { createApi } from "@reduxjs/toolkit/query/react";
import { authPath } from "@/lib/apiPaths";
import { baseQueryWithReauth } from "@/lib/fetchBaseQueryWithReauth";
import { logout, setCredentials, setSessionChecked } from "@/redux/authSlice";
import type {
  AuthResponse,
  LoginRequest,
  RefreshResponse,
  RegisterRequest,
} from "@/types/auth";
import type {
  CreateTaskRequest,
  GetTasksQueryParams,
  PaginatedTasksResponse,
  Task,
  UpdateTaskRequest,
} from "@/types/task";

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeTask(raw: unknown): Task {
  const obj = asRecord(raw);
  return {
    id: String(obj.id ?? obj._id ?? ""),
    title: String(obj.title ?? ""),
    description: String(obj.description ?? ""),
    status: String(obj.status ?? "PENDING") as Task["status"],
    createdAt: String(obj.createdAt ?? new Date().toISOString()),
  };
}

function normalizePaginatedTasksResponse(raw: unknown): PaginatedTasksResponse {
  if (Array.isArray(raw)) {
    return {
      items: raw.map(normalizeTask),
      page: 1,
      limit: raw.length || 10,
      totalItems: raw.length,
      totalPages: 1,
    };
  }

  const rawObj = asRecord(raw);
  const data = asRecord(rawObj.data ?? rawObj);
  const itemsRaw = data.items ?? data.tasks ?? data.docs ?? [];
  const items = Array.isArray(itemsRaw) ? itemsRaw.map(normalizeTask) : [];
  const page = Number(data.page ?? data.currentPage ?? 1);
  const limit = Number(data.limit ?? data.perPage ?? 10);
  const totalItems = Number(
    data.totalItems ?? data.total ?? data.totalDocs ?? items.length,
  );
  const totalPages = Number(
    data.totalPages ?? Math.max(1, Math.ceil(totalItems / Math.max(1, limit))),
  );

  return { items, page, limit, totalItems, totalPages };
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Task"],
  endpoints: (builder) => ({
    refreshSession: builder.mutation<RefreshResponse, void>({
      query: () => ({
        url: authPath("refresh"),
        method: "POST",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              accessToken: data.data.accessToken,
              user: null,
            }),
          );
        } catch {
          /* invalid session */
        } finally {
          dispatch(setSessionChecked(true));
        }
      },
    }),
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: authPath("login"),
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("login", data);
          dispatch(
            setCredentials({
              accessToken: data.data.accessToken,
              user: data.data.user ?? null,
            }),
          );
        } catch {
          /* UI handles */
        }
      },
    }),
    register: builder.mutation<unknown, RegisterRequest>({
      query: (body) => ({
        url: authPath("register"),
        method: "POST",
        body,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: authPath("logout"),
        method: "POST",
        body: JSON.stringify({
          allSessions: true,
        }),
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          /* still clear client state */
        } finally {
          dispatch(logout());
        }
      },
    }),
    getTasks: builder.query<PaginatedTasksResponse, GetTasksQueryParams>({
      query: ({ page, limit, status, search }) => ({
        url: "/tasks",
        params: {
          page,
          limit,
          ...(status ? { status } : {}),
          ...(search?.trim() ? { search: search.trim() } : {}),
        },
      }),
      transformResponse: (response: unknown) =>
        normalizePaginatedTasksResponse(response),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "Task" as const, id })),
              { type: "Task", id: "LIST" },
            ]
          : [{ type: "Task", id: "LIST" }],
    }),
    createTask: builder.mutation<Task, CreateTaskRequest>({
      query: (body) => ({
        url: "/tasks",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Task", id: "LIST" }],
    }),
    updateTask: builder.mutation<Task, UpdateTaskRequest>({
      query: ({ id, ...patch }) => ({
        url: `/tasks/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (_result, _err, arg) => [
        { type: "Task", id: arg.id },
        { type: "Task", id: "LIST" },
      ],
    }),
    deleteTask: builder.mutation<void, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Task", id },
        { type: "Task", id: "LIST" },
      ],
    }),
    toggleTask: builder.mutation<Task, string>({
      query: (id) => ({
        url: `/tasks/${id}/toggle`,
        method: "PATCH",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Task", id },
        { type: "Task", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useRefreshSessionMutation,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useToggleTaskMutation,
} = api;
