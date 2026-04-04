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
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../utils/catchAsync");
const refreshCookieName = "refreshToken";
const refreshCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: (process.env.NODE_ENV === "production" ? "none" : "strict"),
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: "/",
};
const register = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_service_1.AuthService.registerService(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "User registered successfully",
    });
}));
const login = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_service_1.AuthService.loginService(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User logged in successfully",
        data: {
            accessToken: result.accessToken,
            user: result.user,
        },
        cookies: [
            {
                name: refreshCookieName,
                value: result.refreshToken,
                options: refreshCookieOptions,
            },
        ],
    });
}));
const refreshToken = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const rawRefreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
    const result = yield auth_service_1.AuthService.refreshTokenService(rawRefreshToken);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Token refreshed successfully",
        data: { accessToken: result.accessToken },
        cookies: [
            {
                name: refreshCookieName,
                value: result.refreshToken,
                options: refreshCookieOptions,
            },
        ],
    });
}));
const logout = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const user = req.user;
    if (!user) {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: "Unauthorized.",
        });
        return;
    }
    yield auth_service_1.AuthService.logoutService({
        userId: user.userId,
        refreshToken: (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken,
        allSessions: Boolean((_b = req.body) === null || _b === void 0 ? void 0 : _b.allSessions),
    });
    res.clearCookie(refreshCookieName, refreshCookieOptions);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Logout successful",
    });
}));
exports.AuthController = {
    register,
    login,
    refreshToken,
    logout,
};
