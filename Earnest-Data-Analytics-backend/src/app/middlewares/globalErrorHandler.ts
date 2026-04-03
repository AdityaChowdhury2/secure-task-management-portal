import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
// import { TErrorSource } from "../interface/Error";

// import handleZodError from "../errors/handleZodError";
// import handleValidationError from "../errors/handleValidationError";
// import { handleCastError } from "../errors/handleCastError";
// import handleDuplicateKeyError from "../errors/handleDuplicateKeyError";
import AppError from "../errors/AppError";
import { TErrorSource } from "../interface/Error";
import handleZodError from "../errors/handleZodError";

const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  // Check if headers have already been sent to prevent multiple responses
  if (res.headersSent) {
    return next(error);
  }

  // console.log("Global Error Handler", error);
  // setting Default Values
  let statusCode = error.statusCode || 500;

  let message = error.message || "Something went wrong";

  let errorSources: TErrorSource[] = [
    {
      path: "",
      message: "Something Went Wrong",
    },
  ];

  if (error instanceof ZodError) {
    const simplifiedError = handleZodError(error);

    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    errorSources = [
      {
        path: "",
        message: error.message,
      },
    ];
  } else if (error instanceof Error) {
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

export default globalErrorHandler;

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
