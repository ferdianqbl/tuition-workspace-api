import { prisma } from "@/lib/prisma";
import type { IAuthCreateSessionRequest } from "./auth.types";

export class AuthRepository {
  async createSession({ userId, token, expiresAt }: IAuthCreateSessionRequest) {
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
    } catch {
      throw new Error("Failed to create or update auth session");
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
    } catch {
      throw new Error("Failed to retrieve auth session by token");
    }
  }

  async deleteSessionByToken(token: string) {
    try {
      return await prisma.authSessions.delete({
        where: { token },
      });
    } catch {
      throw new Error("Failed to delete auth session by token");
    }
  }

  async deleteSessionByUserId(userId: string) {
    try {
      return await prisma.authSessions.delete({
        where: { userId },
      });
    } catch {
      throw new Error("Failed to delete auth session by user ID");
    }
  }
}

export const authRepository = new AuthRepository();
