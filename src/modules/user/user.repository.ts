import { prisma } from "../../lib/prisma";
import type { IFindAllUsersRequest } from "./user.types";

export class UserRepository {
  async findAll(params?: IFindAllUsersRequest) {
    const { filters } = params || {};

    return prisma.users.findMany({
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
  }

  async findById(id: string) {
    return prisma.users.findUnique({
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
  }

  async findByUsername(username: string) {
    return prisma.users.findUnique({
      where: { username },
    });
  }

  async create(data: {
    username: string;
    password: string; // Already hashed
    name: string;
    role: "PARENT" | "TUTOR" | "ADMIN";
  }) {
    return prisma.users.create({
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
  }
}

export const userRepository = new UserRepository();
