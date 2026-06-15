import { Prisma } from "@/generated/prisma/client";

export interface AppError extends Error {
  statusCode?: number;
  originalError?: any;
}

export function createAppError(message: string, statusCode = 500, originalError?: any): AppError {
  const error = new Error(message) as AppError;
  error.name = "AppError";
  error.statusCode = statusCode;
  error.originalError = originalError;
  return error;
}

export function handleRepositoryError(
  error: unknown,
  defaultMessage = "Database operation failed"
): never {
  console.error("Repository Error:", error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": {
        const targets = (error.meta?.target as string[]) || [];
        const fieldMsg =
          targets.length > 0 ? ` on field (${targets.join(", ")})` : "";
        throw createAppError(`${defaultMessage}: Record already exists${fieldMsg}`, 409, error);
      }
      case "P2025":
        throw createAppError(`${defaultMessage}: Record not found`, 404, error);
      default:
        throw createAppError(`${defaultMessage}: [${error.code}] ${error.message}`, 500, error);
    }
  }

  if (error instanceof Error) {
    throw createAppError(`${defaultMessage}: ${error.message}`, 500, error);
  }

  throw createAppError(defaultMessage, 500, error);
}
