import { errorResponse, successResponse } from "@/utils/response";
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
      return errorResponse({
        res,
        message: "User ID is required",
        code: 400,
      });
    }

    const user = await userService.getUserById(id);

    if (!user) {
      return errorResponse({
        res,
        message: "User not found",
        code: 404,
      });
    }

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
      return errorResponse({
        res,
        message: "Username is required",
        code: 400,
      });
    }

    const user = await userService.getUserByUsername(username);

    if (!user) {
      return errorResponse({
        res,
        message: "User not found",
        code: 404,
      });
    }

    return successResponse({
      res,
      data: user,
      message: "User retrieved successfully",
      code: 200,
    });
  }
}

export const userController = new UserController();
