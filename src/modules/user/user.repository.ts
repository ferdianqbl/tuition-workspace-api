import { prisma } from "@/lib/prisma";
import { handleRepositoryError } from "@/utils/error";
import type { IFindAllUsersRequest, ISaveUserRequest } from "./user.types";

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
      handleRepositoryError(
        error,
        `Failed to find user by username ${username}`,
      );
    }
  }

  async findForAuth(username: string) {
    try {
      return await prisma.users.findUnique({
        where: { username },
      });
    } catch (error) {
      handleRepositoryError(error, `Auth lookup failed for username ${username}`);
    }
  }

  async create(data: ISaveUserRequest) {
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

  async delete(id: string) {
    try {
      return await prisma.users.delete({
        where: { id },
      });
    } catch (error) {
      const isRecordNotFound = (error as { code?: string })?.code === "P2025";
      if (isRecordNotFound) return null;
      handleRepositoryError(error, "Failed to delete user by ID");
    }
  }

  async update(id: string, data: Partial<ISaveUserRequest>) {
    try {
      return await prisma.users.update({
        where: { id },
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
      handleRepositoryError(error, `Failed to update user`);
    }
  }
}

export const userRepository = new UserRepository();
