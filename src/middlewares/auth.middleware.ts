import type { Request, Response, NextFunction } from "express";
import { Role } from "@/generated/prisma/client";
import { verifyToken } from "@/utils/crypto";
import { userRepository } from "@/modules/user/user.repository";
import { createAppError } from "@/utils/error";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw createAppError("Unauthenticated: No token provided", 401);
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === "string" || !decoded.id) {
      throw createAppError("Unauthenticated: Invalid or expired token", 401);
    }

    const user = await userRepository.findById(decoded.id);
    if (!user) {
      throw createAppError("Unauthenticated: User no longer exists", 401);
    }

    req.user = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createAppError("Unauthenticated: No user session found", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(createAppError("Unauthorized: Insufficient permissions", 403));
    }

    next();
  };
}
