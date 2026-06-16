import { createAppError } from "@/utils/error";
import { successResponse } from "@/utils/response";
import type { Request, Response } from "express";
import { userService } from "./user.service";

export class UserController {
  async getUsers(req: Request, res: Response) {
    const params = {
      filters: req.query as { role?: "PARENT" | "TUTOR" | "ADMIN" },
    };
    const users = await userService.getUsers(params);

    return successResponse({
      res,
      data: users,
      message: "Users retrieved successfully",
      code: 200,
    });
  }

  async getUserById(req: Request, res: Response) {
    const { id } = req.params;

    if (typeof id !== "string" || !id) {
      throw createAppError("User ID is required", 400);
    }

    const user = await userService.getUserById(id);

    return successResponse({
      res,
      data: user,
      message: "User retrieved successfully",
      code: 200,
    });
  }

  async getUserByUsername(req: Request, res: Response) {
    const { username } = req.params;

    if (typeof username !== "string" || !username) {
      throw createAppError("Username is required", 400);
    }

    const user = await userService.getUserByUsername(username);

    return successResponse({
      res,
      data: user,
      message: "User retrieved successfully",
      code: 200,
    });
  }

  async createUser(req: Request, res: Response) {
    const { username, password, name, role } = req.body;

    if (!username || !password || !name || !role) {
      throw createAppError(
        "Username, password, name, and role are required",
        400,
      );
    }

    const user = await userService.createUser({
      username,
      password,
      name,
      role,
    });

    return successResponse({
      res,
      data: user,
      message: "User created successfully",
      code: 201,
    });
  }

  async updateUser(req: Request, res: Response) {
    const { id } = req.params;
    const { password, role, username } = req.body;

    if (!id || typeof id !== "string") {
      throw createAppError("User ID is required", 400);
    }

    const user = await userService.update(id, {
      username,
      password,
      role,
    });

    return successResponse({
      res,
      data: user,
      message: "User updated successfully",
      code: 200,
    });
  }

  async deleteUser(req: Request, res: Response) {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      throw createAppError("User ID is required", 400);
    }

    const user = await userService.delete(id);

    return successResponse({
      res,
      data: user,
      message: "User deleted successfully",
      code: 200,
    });
  }
}

export const userController = new UserController();
