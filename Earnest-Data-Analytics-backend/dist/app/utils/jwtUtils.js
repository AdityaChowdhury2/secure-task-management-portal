"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.JwtUtils = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_1 = require("../config/jwt");
const config_1 = __importDefault(require("../config"));
const generateAccessToken = (user) => {
    const expiresIn = user.isRemember
        ? config_1.default.jwt_long_time_period
        : config_1.default.jwt_short_time_period;
    return jsonwebtoken_1.default.sign(Object.assign(Object.assign({}, user), { expiresIn }), config_1.default.jwt_access_secret, {
        algorithm: "HS256",
    });
};
const generateRefreshToken = (user) => {
    const expiresIn = config_1.default.jwt_long_time_period;
    return jsonwebtoken_1.default.sign(Object.assign(Object.assign({}, user), { expiresIn }), config_1.default.jwt_refresh_secret, {
        algorithm: "HS256",
    });
};
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, jwt_1.JWT_SECRET);
};
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, jwt_1.JWT_REFRESH_SECRET);
};
/**
 * Verify JWT token for Socket.IO authentication
 * @param token - JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, jwt_1.JWT_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
exports.JwtUtils = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
};
