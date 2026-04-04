"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const requireAuth = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) {
        res.status(401).json({ message: "Unauthorized: missing access token." });
        return;
    }
    const [type, token] = header.split(" ");
    if (type !== "Bearer" || !token) {
        res.status(401).json({ message: "Unauthorized: invalid access token." });
        return;
    }
    try {
        req.user = jsonwebtoken_1.default.verify(token, config_1.default.jwtAccessSecret);
        next();
    }
    catch (_error) {
        res.status(401).json({ message: "Unauthorized: invalid access token." });
    }
};
exports.requireAuth = requireAuth;
