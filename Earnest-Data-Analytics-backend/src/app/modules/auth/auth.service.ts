import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";
import config from "../../config";
import type { SignOptions } from "jsonwebtoken";
import { randomUUID } from "crypto";

const signAccessToken = (payload: {
  userId: number;
  email: string;
}): string => {
  const expiresIn = config.accessTokenExpiresIn as SignOptions["expiresIn"];
  return jwt.sign(payload, config.jwtAccessSecret, { expiresIn });
};

const signRefreshToken = (payload: {
  userId: number;
  email: string;
}): { token: string; jti: string } => {
  const expiresIn = config.refreshTokenExpiresIn as SignOptions["expiresIn"];
  const jti = randomUUID();
  const token = jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn,
    jwtid: jti,
  });
  return { token, jti };
};

const getRefreshExpiryFromToken = (token: string): Date => {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  if (!decoded?.exp) {
    throw new Error("Invalid refresh token.");
  }
  return new Date(decoded.exp * 1000);
};

const storeRefreshToken = async (
  userId: number,
  jti: string,
  rawToken: string
) => {
  const tokenHash = await bcrypt.hash(rawToken, config.bcryptSaltRounds);
  const expiresAt = getRefreshExpiryFromToken(rawToken);

  await prisma.refreshToken.create({
    data: {
      userId,
      jti,
      tokenHash,
      expiresAt,
      revoked: false,
    },
  });
};

const register = async (payload: {
  name: string;
  email: string;
  password: string;
}) => {
  const existing = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (existing) throw new Error("Email already exists.");

  const passwordHash = await bcrypt.hash(
    payload.password,
    config.bcryptSaltRounds,
  );
  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      passwordHash,
    },
  });

  // const tokens = {
  //   accessToken: signAccessToken({ userId: user.id, email: user.email }),
  //   refreshToken: signRefreshToken({ userId: user.id, email: user.email }),
  // };

  // await prisma.user.update({
  //   where: { id: user.id },
  //   data: { refreshToken: tokens.refreshToken },
  // });

  return { user: { id: user.id, name: user.name, email: user.email } };
};

const login = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (!user) throw new Error("Invalid email or password.");

  const isMatch = await bcrypt.compare(payload.password, user.passwordHash);
  if (!isMatch) throw new Error("Invalid email or password.");

  const tokens = {
    accessToken: signAccessToken({ userId: user.id, email: user.email }),
    refresh: signRefreshToken({ userId: user.id, email: user.email }),
  };

  await storeRefreshToken(user.id, tokens.refresh.jti, tokens.refresh.token);

  return {
    user: { id: user.id, name: user.name, email: user.email },
    accessToken: tokens.accessToken,
    refreshToken: tokens.refresh.token,
  };
};

const refresh = async (refreshToken: string) => {
  const payload = jwt.verify(refreshToken, config.jwtRefreshSecret) as {
    userId: number;
    email: string;
    jti?: string;
  };

  const tokenJti = payload.jti;
  if (!tokenJti) {
    throw new Error("Invalid refresh token.");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    throw new Error("Invalid refresh token.");
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { jti: tokenJti },
  });

  const invalidStoredToken =
    !storedToken ||
    storedToken.userId !== user.id ||
    storedToken.revoked ||
    storedToken.expiresAt <= new Date();
  if (invalidStoredToken) {
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    throw new Error("Refresh token reuse detected. Please log in again.");
  }

  const tokenMatches = await bcrypt.compare(refreshToken, storedToken.tokenHash);
  if (!tokenMatches) {
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    throw new Error("Refresh token reuse detected. Please log in again.");
  }

  await prisma.refreshToken.delete({ where: { id: storedToken.id } });

  const newAccessToken = signAccessToken({ userId: user.id, email: user.email });
  const newRefresh = signRefreshToken({ userId: user.id, email: user.email });
  await storeRefreshToken(user.id, newRefresh.jti, newRefresh.token);

  return { accessToken: newAccessToken, refreshToken: newRefresh.token };
};

const logout = async (payload: {
  userId: number;
  refreshToken?: string;
  allSessions?: boolean;
}) => {
  if (payload.allSessions) {
    await prisma.refreshToken.deleteMany({
      where: { userId: payload.userId },
    });
    return;
  }

  if (!payload.refreshToken) return;

  let decoded: { jti?: string } | null = null;
  try {
    decoded = jwt.verify(payload.refreshToken, config.jwtRefreshSecret) as {
      jti?: string;
    };
  } catch (_error) {
    decoded = jwt.decode(payload.refreshToken) as { jti?: string } | null;
  }

  const tokenJti = decoded?.jti;
  if (!tokenJti) {
    return;
  }
  await prisma.refreshToken.deleteMany({
    where: {
      userId: payload.userId,
      jti: tokenJti,
    },
  });
};

export const AuthService = {
  registerService: register,
  loginService: login,
  refreshTokenService: refresh,
  logoutService: logout,
};
