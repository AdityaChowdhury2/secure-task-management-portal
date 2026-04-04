"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    port: Number(process.env.PORT || 5000),
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "access-secret-dev",
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "refresh-secret-dev",
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 10),
    nodeEnv: process.env.NODE_ENV || "development",
};
