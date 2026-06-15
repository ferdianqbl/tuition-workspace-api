import { prisma } from "../../lib/prisma";
import { handleRepositoryError } from "@/utils/error";

export class AuthRepository {
  async createSession(userId: string, token: string, expiresAt: Date) {
    try {
      return await prisma.authSessions.upsert({
        where: { userId },
        update: {
          token,
          expiresAt,
        },
        create: {
          userId,
          token,
          expiresAt,
        },
      });
    } catch (error) {
      handleRepositoryError(error, "Failed to create or update auth session");
    }
  }

  async findSessionByToken(token: string) {
    try {
      return await prisma.authSessions.findUnique({
        where: { token },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              role: true,
            },
          },
        },
      });
    } catch (error) {
      handleRepositoryError(error, "Failed to retrieve auth session by token");
    }
  }

  async deleteSessionByToken(token: string) {
    try {
      return await prisma.authSessions.delete({
        where: { token },
      });
    } catch (error) {
      // Return null if session wasn't found anyway, else handle other DB errors
      const isRecordNotFound = (error as any)?.code === "P2025";
      if (isRecordNotFound) return null;
      handleRepositoryError(error, "Failed to delete auth session by token");
    }
  }

  async deleteSessionByUserId(userId: string) {
    try {
      return await prisma.authSessions.delete({
        where: { userId },
      });
    } catch (error) {
      const isRecordNotFound = (error as any)?.code === "P2025";
      if (isRecordNotFound) return null;
      handleRepositoryError(error, "Failed to delete auth session by user ID");
    }
  }
}

export const authRepository = new AuthRepository();
