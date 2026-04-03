import jwt from "jsonwebtoken";
import {
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_SECRET,
} from "../config/jwt";
import type { StringValue } from "ms";
import { Role } from "@prisma/client";
import config from "../config";

const generateAccessToken = (user: {
  userId: string;
  role: Role;
  isRemember: boolean;
}) => {
  const expiresIn = user.isRemember
    ? config.jwt_long_time_period
    : config.jwt_short_time_period;
  return jwt.sign({ ...user, expiresIn }, config.jwt_access_secret, {
    algorithm: "HS256",
  });
};
const generateRefreshToken = (user: { userId: string; role: Role }) => {
  const expiresIn = config.jwt_long_time_period;
  return jwt.sign({ ...user, expiresIn }, config.jwt_refresh_secret, {
    algorithm: "HS256",
  });
};

const verifyAccessToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET as string);
};

const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, JWT_REFRESH_SECRET as string);
};

/**
 * Verify JWT token for Socket.IO authentication
 * @param token - JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET as string) as any;
  } catch (error) {
    return null;
  }
};

export const JwtUtils = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};

// Export individual functions for direct import
export { verifyToken };
