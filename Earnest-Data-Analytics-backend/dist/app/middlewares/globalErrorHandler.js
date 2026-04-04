"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
// import { TErrorSource } from "../interface/Error";
// import handleZodError from "../errors/handleZodError";
// import handleValidationError from "../errors/handleValidationError";
// import { handleCastError } from "../errors/handleCastError";
// import handleDuplicateKeyError from "../errors/handleDuplicateKeyError";
const AppError_1 = __importDefault(require("../errors/AppError"));
const handleZodError_1 = __importDefault(require("../errors/handleZodError"));
const globalErrorHandler = (error, req, res, next) => {
    // Check if headers have already been sent to prevent multiple responses
    if (res.headersSent) {
        return next(error);
    }
    // console.log("Global Error Handler", error);
    // setting Default Values
    let statusCode = error.statusCode || 500;
    let message = error.message || "Something went wrong";
    let errorSources = [
        {
            path: "",
            message: "Something Went Wrong",
        },
    ];
    if (error instanceof zod_1.ZodError) {
        const simplifiedError = (0, handleZodError_1.default)(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = simplifiedError.errorSources;
    }
    else if (error instanceof AppError_1.default) {
        statusCode = error.statusCode;
        message = error.message;
        errorSources = [
            {
                path: "",
                message: error.message,
            },
        ];
    }
    else if (error instanceof Error) {
        message = error.message;
        errorSources = [
            {
                path: "",
                message: error.message,
            },
        ];
    }
    // send response
    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        // error,
        stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
    });
};
exports.default = globalErrorHandler;
/*
* Error Response Structure

{
  "success": false,
  "message": "Something went wrong",
  "errorSource": {
    "path": "name",
    "message": "Name is required"
  },
  "stack": "Error: Name is required" // only for development mode
}
*/
