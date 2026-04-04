"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.signRefreshToken = exports.signAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const signAccessToken = (payload) => {
    const expiresIn = config_1.config.accessTokenExpiresIn;
    return jsonwebtoken_1.default.sign(payload, config_1.config.jwtAccessSecret, {
        expiresIn,
    });
};
exports.signAccessToken = signAccessToken;
const signRefreshToken = (payload) => {
    const expiresIn = config_1.config.refreshTokenExpiresIn;
    return jsonwebtoken_1.default.sign(payload, config_1.config.jwtRefreshSecret, {
        expiresIn,
    });
};
exports.signRefreshToken = signRefreshToken;
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, config_1.config.jwtAccessSecret);
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, config_1.config.jwtRefreshSecret);
};
exports.verifyRefreshToken = verifyRefreshToken;
