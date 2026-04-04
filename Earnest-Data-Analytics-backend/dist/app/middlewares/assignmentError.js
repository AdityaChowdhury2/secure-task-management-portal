"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignmentErrorHandler = exports.assignmentNotFound = void 0;
const zod_1 = require("zod");
const assignmentNotFound = (_req, res) => {
    res.status(404).json({ message: "Route not found." });
};
exports.assignmentNotFound = assignmentNotFound;
const assignmentErrorHandler = (error, _req, res, _next) => {
    if (error instanceof zod_1.ZodError) {
        res.status(400).json({
            message: "Validation failed.",
            errors: error.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
            })),
        });
        return;
    }
    if (error instanceof Error) {
        res.status(400).json({ message: error.message });
        return;
    }
    res.status(500).json({ message: "Internal server error." });
};
exports.assignmentErrorHandler = assignmentErrorHandler;
