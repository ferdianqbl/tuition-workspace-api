import type { TutorProfilesWhereInput } from "@/generated/prisma/models";
import { prisma } from "@/lib/prisma";
import type {
  ITutorFilters,
  ITutorQueryRequest,
  IUpsertTutorProfile,
} from "./tutor.types";

export class TutorRepository {
  async findProfileByUserId(userId: string) {
    try {
      return await prisma.tutorProfiles.findUnique({
        where: { userId },
        include: {
          documents: {
            select: {
              id: true,
              filename: true,
              size: true,
              mimeType: true,
              uploadedAt: true,
            },
          },
        },
      });
    } catch {
      throw new Error(`Failed to retrieve tutor profile for user ${userId}`);
    }
  }

  async findProfileById(id: string) {
    try {
      return await prisma.tutorProfiles.findUnique({
        where: { id },
        include: {
          documents: {
            select: {
              id: true,
              filename: true,
              size: true,
              mimeType: true,
              uploadedAt: true,
            },
          },
        },
      });
    } catch {
      throw new Error(`Failed to retrieve tutor profile ${id}`);
    }
  }

  async findAll(params: ITutorQueryRequest) {
    try {
      const { search, skip, take } = params;
      const where: TutorProfilesWhereInput = {};

      if (search) {
        where.OR = [
          { displayName: { contains: search, mode: "insensitive" } },
          { qualifications: { hasSome: [search] } },
          { experiences: { hasSome: [search] } },
        ];
      }

      return await prisma.tutorProfiles.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          documents: {
            select: {
              id: true,
              filename: true,
              size: true,
              mimeType: true,
              uploadedAt: true,
            },
          },
        },
      });
    } catch {
      throw new Error("Failed to retrieve tutor profiles list");
    }
  }

  async count(params: ITutorFilters) {
    try {
      const { search } = params;
      const where: TutorProfilesWhereInput = {};

      if (search) {
        where.OR = [
          { displayName: { contains: search, mode: "insensitive" } },
          { qualifications: { hasSome: [search] } },
          { experiences: { hasSome: [search] } },
        ];
      }

      return await prisma.tutorProfiles.count({ where });
    } catch {
      throw new Error("Failed to count tutor profiles");
    }
  }

  async upsertProfile(userId: string, data: IUpsertTutorProfile) {
    try {
      return await prisma.tutorProfiles.upsert({
        where: { userId },
        update: {
          displayName: data.displayName,
          qualifications: data.qualifications,
          experiences: data.experiences,
        },
        create: {
          userId,
          displayName: data.displayName,
          qualifications: data.qualifications,
          experiences: data.experiences,
        },
      });
    } catch {
      throw new Error(`Failed to create or update profile for user ${userId}`);
    }
  }

  async createDocument(
    tutorProfileId: string,
    data: { filename: string; size: number; mimeType: string },
  ) {
    try {
      return await prisma.tutorDocuments.create({
        data: {
          tutorProfileId,
          filename: data.filename,
          size: data.size,
          mimeType: data.mimeType,
        },
      });
    } catch {
      throw new Error("Failed to add document to tutor profile");
    }
  }

  async findDocumentById(id: string) {
    try {
      return await prisma.tutorDocuments.findUnique({
        where: { id },
        include: {
          tutor: true,
        },
      });
    } catch {
      throw new Error(`Failed to find tutor document ${id}`);
    }
  }

  async deleteDocumentById(id: string) {
    try {
      return await prisma.tutorDocuments.delete({
        where: { id },
      });
    } catch {
      throw new Error(`Failed to delete tutor document ${id}`);
    }
  }
}

export const tutorRepository = new TutorRepository();
