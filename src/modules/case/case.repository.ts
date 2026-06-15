import { prisma } from "../../lib/prisma";
import { CaseStatus } from "@/generated/prisma/client";
import type { ICaseFilters, ICreateCaseRequest, IUpdateCaseRequest, ICaseQueryRequest } from "./case.types";

export class CaseRepository {
  async createCase(
    userId: string,
    data: ICreateCaseRequest
  ) {
    return prisma.cases.create({
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
  }

  async updateCase(
    id: string,
    data: IUpdateCaseRequest
  ) {
    return prisma.cases.update({
      where: { id },
      data,
    });
  }

  async findCaseById(id: string) {
    return prisma.cases.findUnique({
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
  }

  private buildFilters(filters?: ICaseFilters) {
    const where: any = {};

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

  async findCasesForParent(
    parentId: string,
    params: ICaseQueryRequest
  ) {
    const { skip, take, filters } = params;
    const baseWhere = this.buildFilters(filters);
    const where = {
      ...baseWhere,
      userId: parentId,
    };

    return prisma.cases.findMany({
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
  }

  async countCasesForParent(parentId: string, filters?: ICaseFilters) {
    const baseWhere = this.buildFilters(filters);
    const where = {
      ...baseWhere,
      userId: parentId,
    };

    return prisma.cases.count({ where });
  }

  async findCasesForTutor(
    tutorId: string,
    params: ICaseQueryRequest
  ) {
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

    return prisma.cases.findMany({
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
  }

  async countCasesForTutor(tutorId: string, filters?: ICaseFilters) {
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

    return prisma.cases.count({ where });
  }

  async createAccess(caseId: string, parentId: string, tutorId: string) {
    const existing = await prisma.caseAccesses.findFirst({
      where: { caseId, tutorId },
    });

    if (existing) {
      return prisma.caseAccesses.update({
        where: { id: existing.id },
        data: { revokedAt: null, parentId }, // update parentId just in case
      });
    }

    return prisma.caseAccesses.create({
      data: {
        caseId,
        parentId,
        tutorId,
      },
    });
  }

  async revokeAccess(caseId: string, tutorId: string) {
    return prisma.caseAccesses.updateMany({
      where: {
        caseId,
        tutorId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async findAccess(caseId: string, tutorId: string) {
    return prisma.caseAccesses.findFirst({
      where: {
        caseId,
        tutorId,
        revokedAt: null,
      },
    });
  }

  async createDocument(
    caseId: string,
    data: { filename: string; size: number; mimeType: string }
  ) {
    return prisma.caseDocuments.create({
      data: {
        caseId,
        filename: data.filename,
        size: data.size,
        mimeType: data.mimeType,
      },
    });
  }

  async findDocumentById(id: string) {
    return prisma.caseDocuments.findUnique({
      where: { id },
      include: {
        case: true,
      },
    });
  }
}

export const caseRepository = new CaseRepository();
