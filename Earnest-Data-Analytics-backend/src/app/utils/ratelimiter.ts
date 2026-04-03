import httpStatus from "http-status";
import rateLimit from "express-rate-limit";
import AppError from "../errors/AppError";

const contactLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 hour
  max: 2, // limit each IP to 2 create contact requests per hour
  handler: (req, res, next) => {
    next(
      new AppError(
        httpStatus.TOO_MANY_REQUESTS,
        "Too many contact requests, please try again later."
      )
    );
  },
  standardHeaders: true, // adds `RateLimit-*` headers
  legacyHeaders: false, // disables `X-RateLimit-*` headers
});

export { contactLimiter };
