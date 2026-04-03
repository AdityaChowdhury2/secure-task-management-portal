import { RequestHandler } from "express";
import { AssignmentAuthRequest } from "../../middlewares/assignmentAuth";
import * as tasksService from "./tasks.service";

export const createTask: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as AssignmentAuthRequest).user;
    if (!user) return res.status(401).json({ message: "Unauthorized." });
    const task = await tasksService.createTask(user.userId, req.body);
    return res.status(201).json(task);
  } catch (error) {
    return next(error);
  }
};

export const listTasks: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as AssignmentAuthRequest).user;
    if (!user) return res.status(401).json({ message: "Unauthorized." });
    const result = await tasksService.listTasks({
      userId: user.userId,
      page: Number(req.query.page),
      limit: Number(req.query.limit),
      status: req.query.status as any,
      search: req.query.search as string | undefined,
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

export const getTask: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as AssignmentAuthRequest).user;
    if (!user) return res.status(401).json({ message: "Unauthorized." });
    const taskId = Number(req.params.id);
    const task = await tasksService.getTaskById(taskId, user.userId);
    if (!task) return res.status(404).json({ message: "Task not found." });
    return res.status(200).json(task);
  } catch (error) {
    return next(error);
  }
};

export const updateTask: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as AssignmentAuthRequest).user;
    if (!user) return res.status(401).json({ message: "Unauthorized." });
    const taskId = Number(req.params.id);
    const task = await tasksService.updateTask(taskId, user.userId, req.body);
    if (!task) return res.status(404).json({ message: "Task not found." });
    return res.status(200).json(task);
  } catch (error) {
    return next(error);
  }
};

export const deleteTask: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as AssignmentAuthRequest).user;
    if (!user) return res.status(401).json({ message: "Unauthorized." });
    const taskId = Number(req.params.id);
    const deleted = await tasksService.deleteTask(taskId, user.userId);
    if (!deleted) return res.status(404).json({ message: "Task not found." });
    return res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    return next(error);
  }
};

export const toggleTask: RequestHandler = async (req, res, next) => {
  try {
    const user = (req as AssignmentAuthRequest).user;
    if (!user) return res.status(401).json({ message: "Unauthorized." });
    const taskId = Number(req.params.id);
    const task = await tasksService.toggleTaskStatus(taskId, user.userId);
    if (!task) return res.status(404).json({ message: "Task not found." });
    return res.status(200).json(task);
  } catch (error) {
    return next(error);
  }
};
