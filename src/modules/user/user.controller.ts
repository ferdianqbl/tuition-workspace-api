import { sendResponse } from "@/utils/response";
import type { Request, Response } from "express";
import { userService } from "./user.service";

export class UserController {
  async getUsers(req: Request, res: Response) {
    const params = {
      filters: req.query as { role?: "PARENT" | "TUTOR" | "ADMIN" },
    };
    const users = await userService.getUsers(params);

    return sendResponse(res, 200, "Users retrieved successfully", users);
  }
}

export const userController = new UserController();
