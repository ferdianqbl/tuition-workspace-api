import { CaseStatus } from "@/generated/prisma/client";
import type { CasesWhereInput } from "@/generated/prisma/models";
import { prisma } from "@/lib/prisma";
import type {
  ICaseFilters,
  ICaseQueryRequest,
  ICreateCaseRequest,
  IUpdateCaseRequest,
} from "./case.types";

export class CaseRepository {
  async createCase(userId: string, data: ICreateCaseRequest) {
    try {
      return await prisma.cases.create({
        data: {
          userId,
          title: data.title,
          subject: data.subject,
          level: data.level,
          location: data.location,
          budgetPerHour: data.budgetPerHour,
          status: CaseStatus.OPEN,
        },
      });
    } catch {
      throw new Error("Failed to create tuition case");
    }
  }

  async updateCase(id: string, data: IUpdateCaseRequest) {
    try {
      return await prisma.cases.update({
        where: { id },
        data,
      });
    } catch {
      throw new Error(`Failed to update case ${id}`);
    }
  }

  async findCaseById(id: string) {
    try {
      return await prisma.cases.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              role: true,
            },
          },
          caseDocuments: {
            select: {
              id: true,
              filename: true,
              size: true,
              mimeType: true,
              uploadedAt: true,
            },
          },
          caseAccesses: {
            where: { revokedAt: null },
            select: {
              id: true,
              tutorId: true,
              invitedAt: true,
              tutor: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                },
              },
            },
          },
        },
      });
    } catch {
      throw new Error(`Failed to retrieve case ${id}`);
    }
  }

  private buildFilters(filters?: ICaseFilters) {
    const where: CasesWhereInput = {};

    if (!filters) return where;

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { subject: { contains: filters.search, mode: "insensitive" } },
        { location: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.subject) {
      where.subject = { contains: filters.subject, mode: "insensitive" };
    }

    if (filters.level) {
      where.level = { contains: filters.level, mode: "insensitive" };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    return where;
  }

  async findCasesForParent(parentId: string, params: ICaseQueryRequest) {
    try {
      const { skip, take, filters } = params;
      const baseWhere = this.buildFilters(filters);
      const where = {
        ...baseWhere,
        userId: parentId,
      };

      return await prisma.cases.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          caseDocuments: {
            select: {
              id: true,
              filename: true,
            },
          },
        },
      });
    } catch {
      throw new Error("Failed to retrieve parent cases list");
    }
  }

  async countCasesForParent(parentId: string, filters?: ICaseFilters) {
    try {
      const baseWhere = this.buildFilters(filters);
      const where = {
        ...baseWhere,
        userId: parentId,
      };

      return await prisma.cases.count({ where });
    } catch {
      throw new Error("Failed to count parent cases");
    }
  }

  async findCasesForTutor(tutorId: string, params: ICaseQueryRequest) {
    try {
      const { skip, take, filters } = params;
      const baseWhere = this.buildFilters(filters);
      const where = {
        ...baseWhere,
        caseAccesses: {
          some: {
            tutorId,
            revokedAt: null,
          },
        },
      };

      return await prisma.cases.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          caseDocuments: {
            select: {
              id: true,
              filename: true,
            },
          },
        },
      });
    } catch {
      throw new Error("Failed to retrieve tutor cases list");
    }
  }

  async countCasesForTutor(tutorId: string, filters?: ICaseFilters) {
    try {
      const baseWhere = this.buildFilters(filters);
      const where = {
        ...baseWhere,
        caseAccesses: {
          some: {
            tutorId,
            revokedAt: null,
          },
        },
      };

      return await prisma.cases.count({ where });
    } catch {
      throw new Error("Failed to count tutor cases");
    }
  }

  async createAccess(caseId: string, parentId: string, tutorId: string) {
    try {
      const existing = await prisma.caseAccesses.findFirst({
        where: { caseId, tutorId },
      });

      if (existing) {
        return await prisma.caseAccesses.update({
          where: { id: existing.id },
          data: { revokedAt: null, parentId },
        });
      }

      return await prisma.caseAccesses.create({
        data: {
          caseId,
          parentId,
          tutorId,
        },
      });
    } catch {
      throw new Error("Failed to grant tutor access to case");
    }
  }

  async revokeAccess(caseId: string, tutorId: string) {
    try {
      return await prisma.caseAccesses.updateMany({
        where: {
          caseId,
          tutorId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    } catch {
      throw new Error("Failed to revoke tutor access to case");
    }
  }

  async findAccess(caseId: string, tutorId: string) {
    try {
      return await prisma.caseAccesses.findFirst({
        where: {
          caseId,
          tutorId,
          revokedAt: null,
        },
      });
    } catch {
      throw new Error("Failed to retrieve case access details");
    }
  }

  async createDocument(
    caseId: string,
    data: { filename: string; size: number; mimeType: string },
  ) {
    try {
      return await prisma.caseDocuments.create({
        data: {
          caseId,
          filename: data.filename,
          size: data.size,
          mimeType: data.mimeType,
        },
      });
    } catch {
      throw new Error("Failed to create case document");
    }
  }

  async findDocumentById(id: string) {
    try {
      return await prisma.caseDocuments.findUnique({
        where: { id },
        include: {
          case: true,
        },
      });
    } catch {
      throw new Error(`Failed to retrieve case document ${id}`);
    }
  }
}

export const caseRepository = new CaseRepository();
