import { Router } from "express";
import { requireAuth } from "../../middlewares/assignmentAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  toggleTask,
  updateTask,
} from "./tasks.controller";
import {
  createTaskSchema,
  listTaskQuerySchema,
  taskIdParamSchema,
  updateTaskSchema,
} from "./tasks.validation";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: Finish assignment
 *         description:
 *           type: string
 *           nullable: true
 *           example: Add auth and task docs
 *         status:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED]
 *         userId:
 *           type: integer
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateTaskRequest:
 *       type: object
 *       required: [title]
 *       properties:
 *         title:
 *           type: string
 *           example: Build tasks API
 *         description:
 *           type: string
 *           example: Add pagination and search
 *         status:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED]
 *     UpdateTaskRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED]
 *     TaskListResponse:
 *       type: object
 *       properties:
 *         meta:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 10
 *             total:
 *               type: integer
 *               example: 24
 *             totalPages:
 *               type: integer
 *               example: 3
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Task'
 *
 * /api/v1/tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: List tasks (paginated, filter, search)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search tasks by title
 *     responses:
 *       200:
 *         description: Task list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskListResponse'
 *       401:
 *         description: Unauthorized
 *   post:
 *     tags: [Tasks]
 *     summary: Create a task
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskRequest'
 *     responses:
 *       201:
 *         description: Task created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *
 * /api/v1/tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get task by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task details
 *       404:
 *         description: Task not found
 *   patch:
 *     tags: [Tasks]
 *     summary: Update task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTaskRequest'
 *     responses:
 *       200:
 *         description: Task updated
 *       404:
 *         description: Task not found
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task deleted
 *       404:
 *         description: Task not found
 *
 * /api/v1/tasks/{id}/toggle:
 *   patch:
 *     tags: [Tasks]
 *     summary: Toggle task status between PENDING and COMPLETED
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task status toggled
 *       404:
 *         description: Task not found
 */
router.use(requireAuth);
router.get("/", validateRequest(listTaskQuerySchema), listTasks);
router.post("/", validateRequest(createTaskSchema), createTask);
router.get("/:id", validateRequest(taskIdParamSchema), getTask);
router.patch(
  "/:id",
  validateRequest(taskIdParamSchema),
  validateRequest(updateTaskSchema),
  updateTask,
);
router.delete("/:id", validateRequest(taskIdParamSchema), deleteTask);
router.patch("/:id/toggle", validateRequest(taskIdParamSchema), toggleTask);

export const TaskRoutes = router;
