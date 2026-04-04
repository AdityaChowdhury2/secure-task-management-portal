"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../../config/prisma"));
const config_1 = __importDefault(require("../../config"));
const crypto_1 = require("crypto");
const signAccessToken = (payload) => {
    const expiresIn = config_1.default.accessTokenExpiresIn;
    return jsonwebtoken_1.default.sign(payload, config_1.default.jwtAccessSecret, { expiresIn });
};
const signRefreshToken = (payload) => {
    const expiresIn = config_1.default.refreshTokenExpiresIn;
    const jti = (0, crypto_1.randomUUID)();
    const token = jsonwebtoken_1.default.sign(payload, config_1.default.jwtRefreshSecret, {
        expiresIn,
        jwtid: jti,
    });
    return { token, jti };
};
const getRefreshExpiryFromToken = (token) => {
    const decoded = jsonwebtoken_1.default.decode(token);
    if (!(decoded === null || decoded === void 0 ? void 0 : decoded.exp)) {
        throw new Error("Invalid refresh token.");
    }
    return new Date(decoded.exp * 1000);
};
const storeRefreshToken = (userId, jti, rawToken) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenHash = yield bcrypt_1.default.hash(rawToken, config_1.default.bcryptSaltRounds);
    const expiresAt = getRefreshExpiryFromToken(rawToken);
    yield prisma_1.default.refreshToken.create({
        data: {
            userId,
            jti,
            tokenHash,
            expiresAt,
            revoked: false,
        },
    });
});
const register = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield prisma_1.default.user.findUnique({
        where: { email: payload.email },
    });
    if (existing)
        throw new Error("Email already exists.");
    const passwordHash = yield bcrypt_1.default.hash(payload.password, config_1.default.bcryptSaltRounds);
    const user = yield prisma_1.default.user.create({
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
});
const login = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { email: payload.email },
    });
    if (!user)
        throw new Error("Invalid email or password.");
    const isMatch = yield bcrypt_1.default.compare(payload.password, user.passwordHash);
    if (!isMatch)
        throw new Error("Invalid email or password.");
    const tokens = {
        accessToken: signAccessToken({ userId: user.id, email: user.email }),
        refresh: signRefreshToken({ userId: user.id, email: user.email }),
    };
    yield storeRefreshToken(user.id, tokens.refresh.jti, tokens.refresh.token);
    return {
        user: { id: user.id, name: user.name, email: user.email },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refresh.token,
    };
});
const refresh = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = jsonwebtoken_1.default.verify(refreshToken, config_1.default.jwtRefreshSecret);
    const tokenJti = payload.jti;
    if (!tokenJti) {
        throw new Error("Invalid refresh token.");
    }
    const user = yield prisma_1.default.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
        throw new Error("Invalid refresh token.");
    }
    const storedToken = yield prisma_1.default.refreshToken.findUnique({
        where: { jti: tokenJti },
    });
    const invalidStoredToken = !storedToken ||
        storedToken.userId !== user.id ||
        storedToken.revoked ||
        storedToken.expiresAt <= new Date();
    if (invalidStoredToken) {
        yield prisma_1.default.refreshToken.deleteMany({ where: { userId: user.id } });
        throw new Error("Refresh token reuse detected. Please log in again.");
    }
    const tokenMatches = yield bcrypt_1.default.compare(refreshToken, storedToken.tokenHash);
    if (!tokenMatches) {
        yield prisma_1.default.refreshToken.deleteMany({ where: { userId: user.id } });
        throw new Error("Refresh token reuse detected. Please log in again.");
    }
    yield prisma_1.default.refreshToken.delete({ where: { id: storedToken.id } });
    const newAccessToken = signAccessToken({
        userId: user.id,
        email: user.email,
    });
    const newRefresh = signRefreshToken({ userId: user.id, email: user.email });
    yield storeRefreshToken(user.id, newRefresh.jti, newRefresh.token);
    return { accessToken: newAccessToken, refreshToken: newRefresh.token };
});
const logout = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload.allSessions) {
        yield prisma_1.default.refreshToken.deleteMany({
            where: { userId: payload.userId },
        });
        return;
    }
    if (!payload.refreshToken)
        return;
    let decoded = null;
    try {
        decoded = jsonwebtoken_1.default.verify(payload.refreshToken, config_1.default.jwtRefreshSecret);
    }
    catch (_error) {
        decoded = jsonwebtoken_1.default.decode(payload.refreshToken);
    }
    const tokenJti = decoded === null || decoded === void 0 ? void 0 : decoded.jti;
    if (!tokenJti) {
        return;
    }
    yield prisma_1.default.refreshToken.deleteMany({
        where: {
            userId: payload.userId,
            jti: tokenJti,
        },
    });
});
exports.AuthService = {
    registerService: register,
    loginService: login,
    refreshTokenService: refresh,
    logoutService: logout,
};
