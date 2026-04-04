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
exports.logout = exports.refresh = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = require("../../config");
const prisma_1 = require("../../prisma");
const token_1 = require("../../utils/token");
const tokenResponse = (userId, email) => {
    const payload = { userId, email };
    return {
        accessToken: (0, token_1.signAccessToken)(payload),
        refreshToken: (0, token_1.signRefreshToken)(payload),
    };
};
const register = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield prisma_1.prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
        throw new Error("Email already exists.");
    }
    const passwordHash = yield bcrypt_1.default.hash(input.password, config_1.config.bcryptSaltRounds);
    const user = yield prisma_1.prisma.user.create({
        data: {
            name: input.name,
            email: input.email,
            passwordHash,
        },
    });
    const tokens = tokenResponse(user.id, user.email);
    yield prisma_1.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
    });
    return Object.assign({ user: { id: user.id, name: user.name, email: user.email } }, tokens);
});
exports.register = register;
const login = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.prisma.user.findUnique({ where: { email: input.email } });
    if (!user)
        throw new Error("Invalid email or password.");
    const isMatch = yield bcrypt_1.default.compare(input.password, user.passwordHash);
    if (!isMatch)
        throw new Error("Invalid email or password.");
    const tokens = tokenResponse(user.id, user.email);
    yield prisma_1.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
    });
    return Object.assign({ user: { id: user.id, name: user.name, email: user.email } }, tokens);
});
exports.login = login;
const refresh = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = (0, token_1.verifyRefreshToken)(refreshToken);
    const user = yield prisma_1.prisma.user.findUnique({
        where: { id: payload.userId },
    });
    if (!user || user.refreshToken !== refreshToken) {
        throw new Error("Invalid refresh token.");
    }
    const accessToken = (0, token_1.signAccessToken)({ userId: user.id, email: user.email });
    return { accessToken };
});
exports.refresh = refresh;
const logout = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null },
    });
});
exports.logout = logout;
