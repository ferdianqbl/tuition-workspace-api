import { Role } from "../../generated/prisma/enums";
import { createAppError } from "../../utils/error";
import bcrypt from "bcryptjs";
import { userRepository } from "./user.repository";
import type { IFindAllUsersRequest, ISaveUserRequest } from "./user.types";

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

  async createUser(data: ISaveUserRequest) {
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

  async update(id: string, data: Partial<ISaveUserRequest>) {
    const { password, role } = data;

    if (
      role !== undefined &&
      role !== Role.ADMIN &&
      role !== Role.PARENT &&
      role !== Role.TUTOR
    ) {
      throw createAppError("Invalid user role", 400);
    }

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    return userRepository.update(id, data);
  }

  async delete(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw createAppError("User not found", 404);
    }
    return userRepository.delete(id);
  }
}

export const userService = new UserService();
