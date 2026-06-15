import { Prisma } from "@/generated/prisma/client";

export class DatabaseError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class NotFoundError extends DatabaseError {
  constructor(message: string, originalError?: any) {
    super(message, originalError);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends DatabaseError {
  constructor(message: string, originalError?: any) {
    super(message, originalError);
    this.name = "ConflictError";
  }
}

export function handleRepositoryError(error: unknown, defaultMessage = "Database operation failed"): never {
  console.error("Repository Error:", error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        // Unique constraint failed
        const targets = (error.meta?.target as string[]) || [];
        const fieldMsg = targets.length > 0 ? ` on field (${targets.join(", ")})` : "";
        throw new ConflictError(`${defaultMessage}: Record already exists${fieldMsg}`, error);
      case "P2025":
        // Record not found
        throw new NotFoundError(`${defaultMessage}: Record not found`, error);
      default:
        throw new DatabaseError(`${defaultMessage}: [${error.code}] ${error.message}`, error);
    }
  }

  if (error instanceof Error) {
    throw new DatabaseError(`${defaultMessage}: ${error.message}`, error);
  }

  throw new DatabaseError(defaultMessage, error);
}
