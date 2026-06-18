import "multer";
import { successResponse } from "@/utils/response";
import type { Request, Response } from "express";
import { tutorService } from "./tutor.service";
import { createAppError } from "@/utils/error";

export class TutorController {
  async getProfiles(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Build params type-safely to satisfy exactOptionalPropertyTypes
    const serviceParams: { page: number; limit: number; search?: string } = {
      page,
      limit,
    };
    if (typeof req.query.search === "string" && req.query.search) {
      serviceParams.search = req.query.search;
    }

    const result = await tutorService.getProfiles(serviceParams);

    return successResponse({
      res,
      data: result,
      message: "Tutor directory retrieved successfully",
      code: 200,
    });
  }

  async getMyProfile(req: Request, res: Response) {
    if (!req.user) {
      throw createAppError("Unauthenticated", 401);
    }

    const profile = await tutorService.getProfileByUserId(req.user.id);

    return successResponse({
      res,
      data: profile,
      message: "My tutor profile retrieved successfully",
      code: 200,
    });
  }

  async getProfileById(req: Request, res: Response) {
    if (!req.user) {
      throw createAppError("Unauthenticated", 401);
    }

    const id = typeof req.params.id === "string" ? req.params.id : undefined;
    if (!id) {
      throw createAppError("Tutor profile ID is required", 400);
    }

    const profile = await tutorService.getProfileById(id, req.user);

    return successResponse({
      res,
      data: profile,
      message: "Tutor profile retrieved successfully",
      code: 200,
    });
  }

  async upsertProfile(req: Request, res: Response) {
    if (!req.user) {
      throw createAppError("Unauthenticated", 401);
    }

    const { displayName, qualifications, experiences } = req.body;

    if (!displayName) {
      throw createAppError("Display name is required", 400);
    }

    const parsedQualifications = Array.isArray(qualifications)
      ? (qualifications as string[])
      : typeof qualifications === "string" && qualifications
      ? [qualifications]
      : [];

    const parsedExperiences = Array.isArray(experiences)
      ? (experiences as string[])
      : typeof experiences === "string" && experiences
      ? [experiences]
      : [];

    const profile = await tutorService.upsertProfile(req.user.id, {
      displayName,
      qualifications: parsedQualifications,
      experiences: parsedExperiences,
    });

    return successResponse({
      res,
      data: profile,
      message: "Tutor profile updated successfully",
      code: 200,
    });
  }

  async uploadDocument(req: Request, res: Response) {
    if (!req.user) {
      throw createAppError("Unauthenticated", 401);
    }

    const file = req.file;
    if (!file) {
      throw createAppError("No file uploaded or file rejected by filter", 400);
    }

    const document = await tutorService.uploadDocument(req.user.id, file);

    return successResponse({
      res,
      data: document,
      message: "Tutor document uploaded successfully",
      code: 201,
    });
  }

  async deleteDocument(req: Request, res: Response) {
    if (!req.user) {
      throw createAppError("Unauthenticated", 401);
    }

    const docId = typeof req.params.docId === "string" ? req.params.docId : undefined;
    if (!docId) {
      throw createAppError("Document ID is required", 400);
    }

    await tutorService.deleteDocument(req.user.id, docId);

    return successResponse({
      res,
      data: null,
      message: "Tutor document deleted successfully",
      code: 200,
    });
  }
}

export const tutorController = new TutorController();
