"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_REFRESH_EXPIRES_IN = exports.JWT_EXPIRES_IN = exports.JWT_REFRESH_SECRET = exports.JWT_SECRET = void 0;
const _1 = __importDefault(require("."));
exports.JWT_SECRET = _1.default.jwtAccessSecret || "supersecret";
exports.JWT_REFRESH_SECRET = _1.default.jwtRefreshSecret || "supersecret";
exports.JWT_EXPIRES_IN = _1.default.accessTokenExpiresIn || "7d";
exports.JWT_REFRESH_EXPIRES_IN = _1.default.refreshTokenExpiresIn || "2h";
