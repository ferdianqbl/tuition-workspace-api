import { successResponse } from "../../utils/response";
import type { Request, Response } from "express";
import { authService } from "./auth.service";
import { createAppError } from "../../utils/error";

export class AuthController {
  async register(req: Request, res: Response) {
    const { username, password, name, role } = req.body;

    if (!username || !password || !name || !role) {
      throw createAppError("Username, password, name, and role are required", 400);
    }

    const user = await authService.register({ username, password, name, role });

    return successResponse({
      res,
      data: user,
      message: "User registered successfully",
      code: 201,
    });
  }

  async login(req: Request, res: Response) {
    const { username, password } = req.body;

    if (!username || !password) {
      throw createAppError("Username and password are required", 400);
    }

    const result = await authService.login({ username, password });

    // Set secure HTTP-only session cookie containing JWT
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Lax is safer for cross-site auth during local dev/production setups
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return successResponse({
      res,
      data: result,
      message: "Logged in successfully",
      code: 200,
    });
  }

  async logout(req: Request, res: Response) {
    res.clearCookie("token");

    return successResponse({
      res,
      data: null,
      message: "Logged out successfully",
      code: 200,
    });
  }

  async me(req: Request, res: Response) {
    if (!req.user) {
      throw createAppError("Unauthenticated", 401);
    }

    return successResponse({
      res,
      data: req.user,
      message: "Current user session retrieved successfully",
      code: 200,
    });
  }
}

export const authController = new AuthController();
