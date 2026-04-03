import { Prisma, TaskStatus } from "@prisma/client";
import prisma from "../../config/prisma";

export const createTask = async (
  userId: number,
  payload: { title: string; description?: string; status?: TaskStatus }
) => {
  return prisma.task.create({
    data: {
      title: payload.title,
      description: payload.description,
      status: payload.status ?? TaskStatus.PENDING,
      userId,
    },
  });
};

export const listTasks = async (opts: {
  userId: number;
  page: number;
  limit: number;
  status?: TaskStatus;
  search?: string;
}) => {
  const where: Prisma.TaskWhereInput = {
    userId: opts.userId,
    ...(opts.status ? { status: opts.status } : {}),
    ...(opts.search ? { title: { contains: opts.search } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip: (opts.page - 1) * opts.limit,
      take: opts.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.task.count({ where }),
  ]);

  return {
    meta: {
      page: opts.page,
      limit: opts.limit,
      total,
      totalPages: Math.ceil(total / opts.limit) || 1,
    },
    items,
  };
};

export const getTaskById = async (id: number, userId: number) => {
  return prisma.task.findFirst({ where: { id, userId } });
};

export const updateTask = async (
  id: number,
  userId: number,
  payload: { title?: string; description?: string | null; status?: TaskStatus }
) => {
  const existing = await getTaskById(id, userId);
  if (!existing) return null;
  return prisma.task.update({ where: { id }, data: payload });
};

export const deleteTask = async (id: number, userId: number) => {
  const existing = await getTaskById(id, userId);
  if (!existing) return false;
  await prisma.task.delete({ where: { id } });
  return true;
};

export const toggleTaskStatus = async (id: number, userId: number) => {
  const existing = await getTaskById(id, userId);
  if (!existing) return null;
  const newStatus =
    existing.status === TaskStatus.COMPLETED
      ? TaskStatus.PENDING
      : TaskStatus.COMPLETED;
  return prisma.task.update({ where: { id }, data: { status: newStatus } });
};
