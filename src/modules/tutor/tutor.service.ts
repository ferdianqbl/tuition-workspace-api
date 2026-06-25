import "multer";
import fs from "node:fs/promises";
import path from "node:path";
import { tutorRepository } from "./tutor.repository";
import { createAppError } from "../../utils/error";
import { UPLOADS_DIR } from "../../lib/uploads";
import type { IUpsertTutorProfile } from "./tutor.types";
import { Role } from "@prisma/client";

export class TutorService {
  async getProfileByUserId(userId: string) {
    const profile = await tutorRepository.findProfileByUserId(userId);
    if (!profile) {
      throw createAppError("Tutor profile not found", 404);
    }
    return profile;
  }

  async getProfileById(
    id: string,
    currentUser: { id: string; role: Role }
  ) {
    const profile = await tutorRepository.findProfileById(id);
    if (!profile) {
      throw createAppError("Tutor profile not found", 404);
    }

    // Authorization: Tutors cannot view other tutors' profiles
    if (currentUser.role === Role.TUTOR && profile.userId !== currentUser.id) {
      throw createAppError("Access denied: Tutors cannot view other tutors' profiles", 403);
    }

    return profile;
  }

  async getProfiles(params: { search?: string; page: number; limit: number }) {
    const { search, page, limit } = params;
    const skip = (page - 1) * limit;
    const take = limit;

    // Build params type-safely to satisfy exactOptionalPropertyTypes
    const queryParams: { skip: number; take: number; search?: string } = {
      skip,
      take,
    };
    if (search) {
      queryParams.search = search;
    }

    const countParams: { search?: string } = {};
    if (search) {
      countParams.search = search;
    }

    const [data, total] = await Promise.all([
      tutorRepository.findAll(queryParams),
      tutorRepository.count(countParams),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async upsertProfile(userId: string, data: IUpsertTutorProfile) {
    return tutorRepository.upsertProfile(userId, data);
  }

  async uploadDocument(
    userId: string,
    file: Express.Multer.File
  ) {
    const profile = await tutorRepository.findProfileByUserId(userId);
    if (!profile) {
      // Clean up uploaded file if profile doesn't exist
      await fs.unlink(file.path).catch(() => null);
      throw createAppError("Tutor profile must be created before uploading documents", 400);
    }

    return tutorRepository.createDocument(profile.id, {
      filename: file.filename,
      size: file.size,
      mimeType: file.mimetype,
    });
  }

  async deleteDocument(userId: string, docId: string) {
    const document = await tutorRepository.findDocumentById(docId);
    if (!document) {
      throw createAppError("Document not found", 404);
    }

    // Verify ownership
    if (document.tutor.userId !== userId) {
      throw createAppError("Unauthorized to delete this document", 403);
    }

    await tutorRepository.deleteDocumentById(docId);

    // Clean up physical file on disk
    const filePath = path.join(UPLOADS_DIR, document.filename);
    await fs.unlink(filePath).catch((err) => {
      console.error("Failed to delete physical file:", err);
    });

    return { success: true };
  }
}

export const tutorService = new TutorService();
