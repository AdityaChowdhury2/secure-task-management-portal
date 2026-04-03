import httpStatus from "http-status";
import { Router } from "express";
import prisma from "../../config/prisma";
import AppError from "../../errors/AppError";
import { catchAsync } from "../../utils/catchAsync";

const router = Router();

/**
 * @openapi
 * /api/v1/health:
 *   get:
 *     summary: Health check endpoint
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Returns OK if server and DB are healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 database:
 *                   type: string
 *                   example: connected
 *       500:
 *         description: Health check failed
 */
router.get(
  "/",
  catchAsync(async (req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  }),
);

export const HealthRoutes = router;
