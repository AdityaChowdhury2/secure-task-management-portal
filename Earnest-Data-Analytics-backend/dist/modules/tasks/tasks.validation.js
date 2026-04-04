"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTaskQuerySchema = exports.updateTaskSchema = exports.createTaskSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(1).max(200),
    description: zod_1.z.string().trim().max(1000).optional(),
    status: zod_1.z.nativeEnum(client_1.TaskStatus).optional(),
});
exports.updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(1).max(200).optional(),
    description: zod_1.z.string().trim().max(1000).nullable().optional(),
    status: zod_1.z.nativeEnum(client_1.TaskStatus).optional(),
});
exports.listTaskQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
    status: zod_1.z.nativeEnum(client_1.TaskStatus).optional(),
    search: zod_1.z.string().trim().optional(),
});
