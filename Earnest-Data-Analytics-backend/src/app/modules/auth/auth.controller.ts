import { AuthService } from "./auth.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { Request, RequestHandler, Response } from "express";
import config from "../../config";

const register: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AuthService.registerService(req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User registered successfully",
    });
  },
);

const login: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AuthService.loginService(req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User logged in successfully",
      data: result,
      cookies: [
        {
          name: "refreshToken",
          value: result.refreshToken,
          options: {
            httpOnly: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
          },
        },
      ],
    });
  },
);

const refreshToken: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AuthService.refreshTokenService(
      req.cookies.refreshToken,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Refresh token generated successfully",
      data: result,
    });
  },
);

const logout: RequestHandler = catchAsync(async (req, res) => {
  // const accessToken = req?.cookies?.accessToken;

  // await AuthService.logoutService(accessToken);
  res.clearCookie("refreshToken", {
    httpOnly: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logout successful",
  });
});

export const AuthController = {
  register,
  login,
  refreshToken,
  logout,
};
