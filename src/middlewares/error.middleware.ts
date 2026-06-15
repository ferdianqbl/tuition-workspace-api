import type { Request, Response, NextFunction } from "express";
import { errorResponse } from "@/utils/response";

export function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 1. Log the full error internally for server debugging
  console.error(`[Error] ${req.method} ${req.url}:`, err);

  // 2. Extract status code and message
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";
  
  // 3. Prevent leaking low-level internal database details in production
  let message = err.message || "Internal Server Error";
  if (isProduction && statusCode === 500) {
    message = "An unexpected database or server error occurred";
  }

  return errorResponse({
    res,
    message,
    code: statusCode,
  });
}
