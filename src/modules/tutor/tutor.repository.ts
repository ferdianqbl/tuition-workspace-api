import { prisma } from "../../lib/prisma";
import type { ITutorFilters, ITutorQueryRequest, IUpsertTutorProfile } from "./tutor.types";

export class TutorRepository {
  async findProfileByUserId(userId: string) {
    return prisma.tutorProfiles.findUnique({
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
  }

  async findProfileById(id: string) {
    return prisma.tutorProfiles.findUnique({
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
  }

  async findAll(params: ITutorQueryRequest) {
    const { search, skip, take } = params;
    const where: any = {};

    if (search) {
      where.OR = [
        { displayName: { contains: search, mode: "insensitive" } },
        { qualifications: { hasSome: [search] } },
        { experiences: { hasSome: [search] } },
      ];
    }

    return prisma.tutorProfiles.findMany({
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
  }

  async count(params: ITutorFilters) {
    const { search } = params;
    const where: any = {};

    if (search) {
      where.OR = [
        { displayName: { contains: search, mode: "insensitive" } },
        { qualifications: { hasSome: [search] } },
        { experiences: { hasSome: [search] } },
      ];
    }

    return prisma.tutorProfiles.count({ where });
  }

  async upsertProfile(
    userId: string,
    data: IUpsertTutorProfile
  ) {
    return prisma.tutorProfiles.upsert({
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
  }

  async createDocument(
    tutorProfileId: string,
    data: { filename: string; size: number; mimeType: string }
  ) {
    return prisma.tutorDocuments.create({
      data: {
        tutorProfileId,
        filename: data.filename,
        size: data.size,
        mimeType: data.mimeType,
      },
    });
  }

  async findDocumentById(id: string) {
    return prisma.tutorDocuments.findUnique({
      where: { id },
      include: {
        tutor: true,
      },
    });
  }

  async deleteDocumentById(id: string) {
    return prisma.tutorDocuments.delete({
      where: { id },
    });
  }
}

export const tutorRepository = new TutorRepository();
