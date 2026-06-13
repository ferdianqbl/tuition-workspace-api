import type { Response } from "express";

export interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
) => {
  return res.status(statusCode).json({
    success: statusCode < 400,
    code: statusCode,
    message,
    data,
  });
};
