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
exports.roleGuard = void 0;
exports.jwtGuard = jwtGuard;
const http_status_1 = __importDefault(require("http-status"));
const jwtUtils_1 = require("../utils/jwtUtils");
const prisma_1 = __importDefault(require("../config/prisma"));
const AppError_1 = __importDefault(require("../errors/AppError"));
/**
 * jwtGuard
 * — Verifies a JWT access token (cookie or Bearer header),
 *   attaches decoded payload to req.user
 * — 401 if missing/invalid
 */
function jwtGuard(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        // 1) Grab token from cookie or Authorization header
        const token = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken) || ((_b = req.headers.authorization) === null || _b === void 0 ? void 0 : _b.split(" ")[1]);
        console.log("token ====>", token);
        if (!token) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
            // res.status(httpStatus.UNAUTHORIZED).json({ message: "Unauthorized" });
            // return;
        }
        try {
            const decoded = jwtUtils_1.JwtUtils.verifyAccessToken(token);
            if (!decoded) {
                throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
                // res.status(httpStatus.UNAUTHORIZED).json({ message: "Unauthorized" });
                // return;
            }
            console.log("decoded ====>", decoded);
            const user = yield prisma_1.default.user.findUnique({
                where: { employeeId: decoded.userId, isDeleted: false },
                select: {
                    passwordChangedAt: true,
                },
            });
            if (!user) {
                throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
                // res.status(httpStatus.UNAUTHORIZED).json({ message: "Unauthorized" });
                // return;
            }
            const issuedAt = decoded.iat * 1000; // convert to ms
            if (issuedAt < user.passwordChangedAt.getTime()) {
                throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Token expired due to password change");
                // res.status(httpStatus.UNAUTHORIZED).json({
                // message: "Token expired due to password change",
                // });
                // return;
            }
            // 2) Attach to req.user
            req.user = decoded;
            next();
        }
        catch (err) {
            console.log("error in jwtGuard", err);
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid token");
            // res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
            // return;
        }
    });
}
/**
 * roleGuard
 * — Returns middleware that 403's unless req.user.role matches
 *   the given requiredRole
 */
const roleGuard = (requiredRole) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
            // res.status(httpStatus.UNAUTHORIZED).json({ message: "Unauthorized" });
            // return;
        }
        if (user.role !== requiredRole) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Forbidden: " + user.role + " is not allowed to access this resource");
            // res.status(httpStatus.FORBIDDEN).json({ message: "Forbidden" });
            // return;
        }
        next();
    };
};
exports.roleGuard = roleGuard;
