import type { Response } from "express";

export interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

export function sendResponse<T>({
  res,
  code,
  success,
  message,
  data,
}: {
  res: Response;
  code: number;
  success: boolean;
  message: string;
  data: T | null;
}): Response {
  const responsePayload: ApiResponse<T | null> = {
    success,
    code,
    message,
    data,
  };
  return res.status(code).json(responsePayload);
}

export function successResponse<T>({
  res,
  data,
  message = "Success",
  code = 200,
}: {
  res: Response;
  data: T;
  message: string;
  code: number;
}): Response {
  return sendResponse({ res, code, success: true, message, data });
}

export function errorResponse({
  res,
  message,
  code = 400,
}: {
  res: Response;
  message: string;
  code?: number;
}): Response {
  return sendResponse({ res, code, success: false, message, data: null });
}
