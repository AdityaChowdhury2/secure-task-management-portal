"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutSchema = exports.refreshSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().trim().min(2).max(100),
        email: zod_1.z.string().trim().email(),
        password: zod_1.z.string().min(6).max(128),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().trim().email(),
        password: zod_1.z.string().min(6).max(128),
    }),
});
exports.refreshSchema = zod_1.z.object({
    cookies: zod_1.z.object({
        refreshToken: zod_1.z.string().min(1),
    }),
});
exports.logoutSchema = zod_1.z.object({
    body: zod_1.z.object({
        allSessions: zod_1.z.boolean().optional().default(false),
    }),
});
