import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
} from "./auth.validation";
import { requireAuth } from "../../middlewares/assignmentAuth";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required: [name, email, password]
 *       properties:
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         password:
 *           type: string
 *           minLength: 6
 *           example: StrongPass123
 *     LoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         password:
 *           type: string
 *           example: StrongPass123
 *     LogoutRequest:
 *       type: object
 *       properties:
 *         allSessions:
 *           type: boolean
 *           default: false
 *           example: false
 *     UserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *     AuthLoginSuccess:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         statusCode:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: User logged in successfully
 *         data:
 *           type: object
 *           properties:
 *             accessToken:
 *               type: string
 *             user:
 *               $ref: '#/components/schemas/UserResponse'
 *     RefreshSuccess:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         statusCode:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: Token refreshed successfully
 *         data:
 *           type: object
 *           properties:
 *             accessToken:
 *               type: string
 *
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error / duplicate email
 *
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and receive access token
 *     description: Returns access token in body and sets refresh token in httpOnly cookie.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthLoginSuccess'
 *       401:
 *         description: Invalid credentials
 *
 * /api/v1/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Rotate refresh token and return new access token
 *     description: Reads refresh token from cookie, rotates token, and sets a new refresh cookie.
 *     security: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshSuccess'
 *       401:
 *         description: Invalid/expired token or reuse detected
 *
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout current session or all sessions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogoutRequest'
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/register",
  validateRequest(registerSchema),
  AuthController.register,
);
router.post("/login", validateRequest(loginSchema), AuthController.login);
router.post(
  "/refresh",
  validateRequest(refreshSchema),
  AuthController.refreshToken,
);
router.post(
  "/logout",
  requireAuth,
  // validateRequest(logoutSchema),
  AuthController.logout,
);

export const AuthRoutes = router;
