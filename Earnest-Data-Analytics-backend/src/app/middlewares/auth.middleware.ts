import httpStatus from "http-status";
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { JwtUtils } from "../utils/jwtUtils";
import { Role } from "@prisma/client";
import prisma from "../config/prisma";
import AppError from "../errors/AppError";

export interface JwtPayload {
  userId: string; // your user ID
  role: Role; // ADMIN | EMPLOYEE
  isRemember: boolean;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

/**
 * jwtGuard
 * — Verifies a JWT access token (cookie or Bearer header),
 *   attaches decoded payload to req.user
 * — 401 if missing/invalid
 */
export async function jwtGuard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // 1) Grab token from cookie or Authorization header
  const token =
    req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

  console.log("token ====>", token);

  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
    // res.status(httpStatus.UNAUTHORIZED).json({ message: "Unauthorized" });
    // return;
  }

  try {
    const decoded = JwtUtils.verifyAccessToken(token) as JwtPayload;
    if (!decoded) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
      // res.status(httpStatus.UNAUTHORIZED).json({ message: "Unauthorized" });
      // return;
    }
    console.log("decoded ====>", decoded);
    const user = await prisma.user.findUnique({
      where: { employeeId: decoded.userId, isDeleted: false },
      select: {
        passwordChangedAt: true,
      },
    });

    if (!user) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
      // res.status(httpStatus.UNAUTHORIZED).json({ message: "Unauthorized" });
      // return;
    }

    const issuedAt = decoded.iat * 1000; // convert to ms
    if (issuedAt < user.passwordChangedAt.getTime()) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Token expired due to password change"
      );
      // res.status(httpStatus.UNAUTHORIZED).json({
      // message: "Token expired due to password change",
      // });
      // return;
    }

    // 2) Attach to req.user
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (err) {
    console.log("error in jwtGuard", err);
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token");
    // res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
    // return;
  }
}

/**
 * roleGuard
 * — Returns middleware that 403's unless req.user.role matches
 *   the given requiredRole
 */
export const roleGuard = (requiredRole: Role) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
      // res.status(httpStatus.UNAUTHORIZED).json({ message: "Unauthorized" });
      // return;
    }
    if (user.role !== requiredRole) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Forbidden: " + user.role + " is not allowed to access this resource"
      );
      // res.status(httpStatus.FORBIDDEN).json({ message: "Forbidden" });
      // return;
    }
    next();
  };
};
