"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const notFound = (req, res, next) => {
    // Check if headers have already been sent to prevent multiple responses
    if (res.headersSent) {
        return next();
    }
    const message = "Api Not Found";
    res.status(http_status_1.default.NOT_FOUND).json({
        success: false,
        message,
    });
};
exports.default = notFound;
