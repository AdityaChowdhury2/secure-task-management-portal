"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleTask = exports.deleteTask = exports.updateTask = exports.getTask = exports.listTasks = exports.createTask = void 0;
const tasksService = __importStar(require("./tasks.service"));
const tasks_validation_1 = require("./tasks.validation");
const parseTaskId = (id) => {
    if (typeof id !== "string") {
        throw new Error("Invalid task id.");
    }
    const parsed = Number(id);
    if (Number.isNaN(parsed) || parsed < 1) {
        throw new Error("Invalid task id.");
    }
    return parsed;
};
const createTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ message: "Unauthorized." });
        return;
    }
    const input = tasks_validation_1.createTaskSchema.parse(req.body);
    const task = yield tasksService.createTask(req.user.userId, input);
    res.status(201).json(task);
});
exports.createTask = createTask;
const listTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ message: "Unauthorized." });
        return;
    }
    const query = tasks_validation_1.listTaskQuerySchema.parse(req.query);
    const result = yield tasksService.listTasks({
        userId: req.user.userId,
        page: query.page,
        limit: query.limit,
        status: query.status,
        search: query.search,
    });
    res.status(200).json(result);
});
exports.listTasks = listTasks;
const getTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ message: "Unauthorized." });
        return;
    }
    const taskId = parseTaskId(req.params.id);
    const task = yield tasksService.getTaskById(taskId, req.user.userId);
    if (!task) {
        res.status(404).json({ message: "Task not found." });
        return;
    }
    res.status(200).json(task);
});
exports.getTask = getTask;
const updateTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ message: "Unauthorized." });
        return;
    }
    const taskId = parseTaskId(req.params.id);
    const payload = tasks_validation_1.updateTaskSchema.parse(req.body);
    const task = yield tasksService.updateTask(taskId, req.user.userId, payload);
    if (!task) {
        res.status(404).json({ message: "Task not found." });
        return;
    }
    res.status(200).json(task);
});
exports.updateTask = updateTask;
const deleteTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ message: "Unauthorized." });
        return;
    }
    const taskId = parseTaskId(req.params.id);
    const deleted = yield tasksService.deleteTask(taskId, req.user.userId);
    if (!deleted) {
        res.status(404).json({ message: "Task not found." });
        return;
    }
    res.status(200).json({ message: "Task deleted successfully." });
});
exports.deleteTask = deleteTask;
const toggleTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ message: "Unauthorized." });
        return;
    }
    const taskId = parseTaskId(req.params.id);
    const task = yield tasksService.toggleTaskStatus(taskId, req.user.userId);
    if (!task) {
        res.status(404).json({ message: "Task not found." });
        return;
    }
    res.status(200).json(task);
});
exports.toggleTask = toggleTask;
