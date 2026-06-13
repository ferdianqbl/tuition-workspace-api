import { sendResponse } from "@/utils/response";
import type { Request, Response } from "express";
import * as userService from "./user.service";

export async function getUsers(req: Request, res: Response) {
  const users = await userService.getUsers();

  return sendResponse(res, 200, "Users retrieved successfully", users);
}
