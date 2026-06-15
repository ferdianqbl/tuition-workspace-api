import { Role } from "@/generated/prisma/enums";
import bcrypt from "bcryptjs";
import { userRepository } from "./user.repository";
import type { ICreateUserRequest, IFindAllUsersRequest } from "./user.types";
import { createAppError } from "@/utils/error";

export class UserService {
  async getUsers(params?: IFindAllUsersRequest) {
    return userRepository.findAll(params);
  }

  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw createAppError("User not found", 404);
    }
    return user;
  }

  async getUserByUsername(username: string) {
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw createAppError("User not found", 404);
    }
    return user;
  }

  async createUser(data: ICreateUserRequest) {
    const { password, username, role } = data;

    if (role !== Role.ADMIN && role !== Role.PARENT && role !== Role.TUTOR) {
      throw createAppError("Invalid user role", 400);
    }

    const existUser = await userRepository.findByUsername(username);

    if (existUser) {
      throw createAppError("User already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return userRepository.create({
      ...data,
      password: hashedPassword,
    });
  }
}

export const userService = new UserService();
