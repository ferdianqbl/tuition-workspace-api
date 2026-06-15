import { prisma } from "../../lib/prisma";

export class AuthRepository {
  async createSession(userId: string, token: string, expiresAt: Date) {
    return prisma.authSessions.upsert({
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
  }

  async findSessionByToken(token: string) {
    return prisma.authSessions.findUnique({
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
  }

  async deleteSessionByToken(token: string) {
    return prisma.authSessions.delete({
      where: { token },
    }).catch(() => null); // ignore if session doesn't exist
  }

  async deleteSessionByUserId(userId: string) {
    return prisma.authSessions.delete({
      where: { userId },
    }).catch(() => null);
  }
}

export const authRepository = new AuthRepository();
