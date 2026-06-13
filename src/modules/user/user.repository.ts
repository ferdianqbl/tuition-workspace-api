import { prisma } from "../../lib/prisma";

export async function findAll() {
  return prisma.users.findMany();
}
