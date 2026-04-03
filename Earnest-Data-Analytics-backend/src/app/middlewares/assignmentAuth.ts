import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config";

type JwtPayload = {
  userId: number;
  email: string;
};

export type AssignmentAuthRequest = Request & {
  user?: JwtPayload;
};

export const requireAuth = (
  req: AssignmentAuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const header = req.headers.authorization;
  if (!header) {
    res.status(401).json({ message: "Unauthorized: missing access token." });
    return;
  }

  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) {
    res.status(401).json({ message: "Unauthorized: invalid access token." });
    return;
  }

  try {
    req.user = jwt.verify(token, config.jwtAccessSecret) as JwtPayload;
    next();
  } catch (_error) {
    res.status(401).json({ message: "Unauthorized: invalid access token." });
  }
};
