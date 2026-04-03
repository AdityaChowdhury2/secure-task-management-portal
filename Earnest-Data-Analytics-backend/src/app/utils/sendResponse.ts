import { Response } from "express";

type TCookieOptions = {
  httpOnly?: boolean;
  sameSite?: "strict" | "lax" | "none";
  secure?: boolean;
  maxAge?: number;
};

type TCookie = {
  name: string;
  value: string;
  options: TCookieOptions;
};

export type TResponse<T> = {
  statusCode: number;
  success: boolean;
  cookies?: TCookie[];
  message?: string;
  data?: any;
};

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  if (data.cookies) {
    data.cookies.forEach((cookie) => {
      res.cookie(cookie.name, cookie.value, cookie.options);
    });
  }
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
  });
};

export default sendResponse;
