import { TaskStatus } from "@prisma/client";
import { z } from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(1000).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(1000).nullable().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
  }),
});

export const listTaskQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    status: z.nativeEnum(TaskStatus).optional(),
    search: z.string().trim().optional(),
  }),
});

export const taskIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().min(1),
  }),
});
