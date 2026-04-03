import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app.error";
import { Prisma } from "@prisma/client";
import { TErrorSource } from "../../app/interface/Error";
import config from "../../app/config";

/**
 * HTTP Exception Filter
 * 
 * Catches all exceptions and returns a standardized error response structure:
 * {
 *   success: false,
 *   message: string,
 *   errorSources: [{ path: string, message: string }],
 *   stack?: string
 * }
 */
export class HttpExceptionFilter {
  static catch(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    // Check if headers have already been sent
    if (res.headersSent) {
      return next(error);
    }

    let statusCode = 500;
    let message = "Something went wrong";
    let errorSources: TErrorSource[] = [
      {
        path: "",
        message: "Something went wrong",
      },
    ];

    // Handle AppError
    if (error instanceof AppError) {
      statusCode = error.statusCode;
      message = error.message;
      errorSources = [
        {
          path: "",
          message: error.message,
        },
      ];
    }
    // Handle Prisma Errors
    else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaError = this.handlePrismaError(error);
      statusCode = prismaError.statusCode;
      message = prismaError.message;
      errorSources = prismaError.errorSources;
    }
    // Handle Prisma Validation Errors
    else if (error instanceof Prisma.PrismaClientValidationError) {
      statusCode = 400;
      message = "Validation Error";
      errorSources = [
        {
          path: "",
          message: error.message,
        },
      ];
    }
    // Handle generic Error
    else if (error instanceof Error) {
      message = error.message;
      errorSources = [
        {
          path: "",
          message: error.message,
        },
      ];
    }

    // Send response
    res.status(statusCode).json({
      success: false,
      message,
      errorSources,
      stack: config.node_environment !== "prod" ? error.stack : undefined,
    });
  }

  /**
   * Handle Prisma specific errors
   */
  private static handlePrismaError(
    error: Prisma.PrismaClientKnownRequestError
  ): {
    statusCode: number;
    message: string;
    errorSources: TErrorSource[];
  } {
    let statusCode = 400;
    let message = "Database error occurred";
    let errorSources: TErrorSource[] = [];

    switch (error.code) {
      // Unique constraint violation (P2002)
      case "P2002": {
        statusCode = 409; // Conflict
        const target = (error.meta?.target as string[]) || [];
        const field = target[0] || "field";
        message = `A record with this ${field} already exists`;
        errorSources = [
          {
            path: field,
            message: `This ${field} is already taken`,
          },
        ];
        break;
      }
      // Record not found (P2025)
      case "P2025": {
        statusCode = 404;
        message = "Record not found";
        errorSources = [
          {
            path: "",
            message: error.meta?.cause as string || "The requested record does not exist",
          },
        ];
        break;
      }
      // Foreign key constraint violation (P2003)
      case "P2003": {
        statusCode = 400;
        message = "Invalid reference";
        const field = (error.meta?.field_name as string) || "field";
        errorSources = [
          {
            path: field,
            message: `Invalid reference in ${field}`,
          },
        ];
        break;
      }
      // Required value is missing (P2011)
      case "P2011": {
        statusCode = 400;
        message = "Required field is missing";
        const field = (error.meta?.field_name as string) || "field";
        errorSources = [
          {
            path: field,
            message: `${field} is required`,
          },
        ];
        break;
      }
      // Value out of range (P2012)
      case "P2012": {
        statusCode = 400;
        message = "Value is out of range";
        errorSources = [
          {
            path: "",
            message: error.message,
          },
        ];
        break;
      }
      default: {
        message = error.message || "Database error occurred";
        errorSources = [
          {
            path: "",
            message: error.message || "An unexpected database error occurred",
          },
        ];
      }
    }

    return {
      statusCode,
      message,
      errorSources,
    };
  }
}

/**
 * Express middleware wrapper for the filter
 */
export const httpExceptionFilter = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  HttpExceptionFilter.catch(error, req, res, next);
};

