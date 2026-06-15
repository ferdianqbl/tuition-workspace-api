import { prisma } from "@/lib/prisma";
import type { IFindAllUsersRequest } from "./user.types";
import { handleRepositoryError } from "@/utils/error";

export class UserRepository {
  async findAll(params?: IFindAllUsersRequest) {
    try {
      const { filters } = params || {};

      return await prisma.users.findMany({
        where: {
          ...(filters?.role && { role: filters.role }),
        },
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      handleRepositoryError(error, "Failed to retrieve users");
    }
  }

  async findById(id: string) {
    try {
      return await prisma.users.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      handleRepositoryError(error, `Failed to find user by ID ${id}`);
    }
  }

  async findByUsername(username: string) {
    try {
      return await prisma.users.findUnique({
        where: { username },
      });
    } catch (error) {
      handleRepositoryError(error, `Failed to find user by username ${username}`);
    }
  }

  async create(data: {
    username: string;
    password: string;
    name: string;
    role: "PARENT" | "TUTOR" | "ADMIN";
  }) {
    try {
      return await prisma.users.create({
        data,
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      handleRepositoryError(error, "Failed to create user");
    }
  }
}

export const userRepository = new UserRepository();
