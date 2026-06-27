import { CaseStatus, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import type {
  ICaseFilters,
  ICaseQueryRequest,
  ICreateCaseRequest,
  IUpdateCaseRequest,
} from "./case.types";
import { handleRepositoryError } from "../../utils/error";

export class CaseRepository {
  async createCase({
    userId,
    data,
  }: {
    userId: string;
    data: ICreateCaseRequest;
  }) {
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
    } catch (error) {
      handleRepositoryError(error, "Failed to create tuition case");
    }
  }

  async updateCase({ id, data }: { id: string; data: IUpdateCaseRequest }) {
    try {
      return await prisma.cases.update({
        where: { id },
        data,
      });
    } catch (error) {
      handleRepositoryError(error, `Failed to update case ${id}`);
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
              uploadedBy: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  role: true,
                },
              },
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
    } catch (error) {
      handleRepositoryError(error, `Failed to retrieve case ${id}`);
    }
  }

  private buildFilters(filters?: ICaseFilters) {
    const where: Prisma.CasesWhereInput = {};

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

  async findAllCases({ params }: { params: ICaseQueryRequest }) {
    try {
      const { skip, take, filters } = params;
      const where = this.buildFilters(filters);

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
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              role: true,
            },
          },
        },
      });
    } catch (error) {
      handleRepositoryError(error, "Failed to retrieve all cases list");
    }
  }

  async countAllCases(params: { filters?: ICaseFilters }) {
    try {
      const { filters } = params;
      const where = this.buildFilters(filters);

      return await prisma.cases.count({ where });
    } catch (error) {
      handleRepositoryError(error, "Failed to count all cases");
    }
  }


  async findCasesForParent({
    parentId,
    params,
  }: {
    parentId: string;
    params: ICaseQueryRequest;
  }) {
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
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              role: true,
            },
          },
        },
      });
    } catch (error) {
      handleRepositoryError(error, "Failed to retrieve parent cases list");
    }
  }

  async countCasesForParent(params: {
    parentId: string;
    filters?: ICaseFilters;
  }) {
    try {
      const { parentId, filters } = params;
      const baseWhere = this.buildFilters(filters);
      const where = {
        ...baseWhere,
        userId: parentId,
      };

      return await prisma.cases.count({ where });
    } catch (error) {
      handleRepositoryError(error, "Failed to count parent cases");
    }
  }

  async findCasesForTutor({
    tutorId,
    params,
  }: {
    tutorId: string;
    params: ICaseQueryRequest;
  }) {
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
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              role: true,
            },
          },
        },
      });
    } catch (error) {
      handleRepositoryError(error, "Failed to retrieve tutor cases list");
    }
  }

  async countCasesForTutor(params: {
    tutorId: string;
    filters?: ICaseFilters;
  }) {
    try {
      const { tutorId, filters } = params;
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
    } catch (error) {
      handleRepositoryError(error, "Failed to count tutor cases");
    }
  }

  async createAccess(params: {
    caseId: string;
    parentId: string;
    tutorId: string;
  }) {
    try {
      const { caseId, parentId, tutorId } = params;
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
    } catch (error) {
      handleRepositoryError(error, "Failed to grant tutor access to case");
    }
  }

  async revokeAccess({ caseId, tutorId }: { caseId: string; tutorId: string }) {
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
    } catch (error) {
      handleRepositoryError(error, "Failed to revoke tutor access to case");
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
    } catch (error) {
      handleRepositoryError(error, "Failed to retrieve case access details");
    }
  }

  async createDocument({
    caseId,
    id,
    uploadedById,
    data,
  }: {
    caseId: string;
    id: string;
    uploadedById: string;
    data: { filename: string; size: number; mimeType: string };
  }) {
    try {
      return await prisma.caseDocuments.create({
        data: {
          id,
          caseId,
          uploadedById,
          filename: data.filename,
          size: data.size,
          mimeType: data.mimeType,
        },
      });
    } catch (error) {
      handleRepositoryError(error, "Failed to create case document");
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
    } catch (error) {
      handleRepositoryError(error, `Failed to retrieve case document ${id}`);
    }
  }
}

export const caseRepository = new CaseRepository();
