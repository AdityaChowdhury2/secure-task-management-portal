import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

const notFound = (req: Request, res: Response, next: NextFunction) => {
  // Check if headers have already been sent to prevent multiple responses
  if (res.headersSent) {
    return next();
  }

  const message = "Api Not Found";
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message,
  });
};

export default notFound;
