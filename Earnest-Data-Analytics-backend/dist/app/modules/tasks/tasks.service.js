"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleTaskStatus = exports.deleteTask = exports.updateTask = exports.getTaskById = exports.listTasks = exports.createTask = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../config/prisma"));
const createTask = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    return prisma_1.default.task.create({
        data: {
            title: payload.title,
            description: payload.description,
            status: (_a = payload.status) !== null && _a !== void 0 ? _a : client_1.TaskStatus.PENDING,
            userId,
        },
    });
});
exports.createTask = createTask;
const listTasks = (opts) => __awaiter(void 0, void 0, void 0, function* () {
    const where = Object.assign(Object.assign({ userId: opts.userId }, (opts.status ? { status: opts.status } : {})), (opts.search ? { title: { contains: opts.search } } : {}));
    const [items, total] = yield Promise.all([
        prisma_1.default.task.findMany({
            where,
            skip: (opts.page - 1) * opts.limit,
            take: opts.limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma_1.default.task.count({ where }),
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
});
exports.listTasks = listTasks;
const getTaskById = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.task.findFirst({ where: { id, userId } });
});
exports.getTaskById = getTaskById;
const updateTask = (id, userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield (0, exports.getTaskById)(id, userId);
    if (!existing)
        return null;
    return prisma_1.default.task.update({ where: { id }, data: payload });
});
exports.updateTask = updateTask;
const deleteTask = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield (0, exports.getTaskById)(id, userId);
    if (!existing)
        return false;
    yield prisma_1.default.task.delete({ where: { id } });
    return true;
});
exports.deleteTask = deleteTask;
const toggleTaskStatus = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield (0, exports.getTaskById)(id, userId);
    if (!existing)
        return null;
    const newStatus = existing.status === client_1.TaskStatus.COMPLETED
        ? client_1.TaskStatus.PENDING
        : client_1.TaskStatus.COMPLETED;
    return prisma_1.default.task.update({ where: { id }, data: { status: newStatus } });
});
exports.toggleTaskStatus = toggleTaskStatus;
