import "multer";
import type { Request, Response } from "express";
import { CaseStatus } from "@/generated/prisma/client";
import { caseService } from "./case.service";
import { successResponse } from "@/utils/response";
import { createAppError } from "@/utils/error";

export class CaseController {
  async createCase(req: Request, res: Response) {
    if (!req.user) {
      throw createAppError("Unauthenticated", 401);
    }

    const { title, subject, level, location, budgetPerHour } = req.body;

    if (!title || !subject || !level || !location || budgetPerHour === undefined) {
      throw createAppError("Missing required fields: title, subject, level, location, and budgetPerHour", 400);
    }

    const numericBudget = Number(budgetPerHour);
    if (isNaN(numericBudget) || numericBudget <= 0) {
      throw createAppError("budgetPerHour must be a valid positive number", 400);
    }

    const tuitionCase = await caseService.createCase(req.user.id, {
      title,
      subject,
      level,
      location,
      budgetPerHour: numericBudget,
    });

    return successResponse({
      res,
      data: tuitionCase,
      message: "Tuition case created successfully",
      code: 201,
    });
  }

  async updateCase(req: Request, res: Response) {
    if (!req.user) {
      throw createAppError("Unauthenticated", 401);
    }

    const id = req.params["id"];
    if (typeof id !== "string" || !id) {
      throw createAppError("Case ID is required and must be a string", 400);
    }

    const { title, subject, level, location, budgetPerHour, status } = req.body;

    const data: {
      title?: string;
      subject?: string;
      level?: string;
      location?: string;
      budgetPerHour?: number;
      status?: CaseStatus;
    } = {};

    if (title !== undefined) data.title = title;
    if (subject !== undefined) data.subject = subject;
    if (level !== undefined) data.level = level;
    if (location !== undefined) data.location = location;
    
    if (budgetPerHour !== undefined) {
      const numericBudget = Number(budgetPerHour);
      if (isNaN(numericBudget) || numericBudget <= 0) {
        throw createAppError("budgetPerHour must be a valid positive number", 400);
      }
      data.budgetPerHour = numericBudget;
    }

    if (status !== undefined) {
      if (!Object.values(CaseStatus).includes(status as CaseStatus)) {
        throw createAppError(`Invalid status. Allowed values are: ${Object.values(CaseStatus).join(", ")}`, 400);
      }
      data.status = status as CaseStatus;
    }

    const updatedCase = await caseService.updateCase(id, req.user.id, req.user.role, data);

    return successResponse({
      res,
      data: updatedCase,
      message: "Tuition case updated successfully",
      code: 200,
    });
  }

  async getCaseById(req: Request, res: Response) {
    if (!req.user) {
      throw createAppError("Unauthenticated", 401);
    }

    const id = req.params["id"];
    if (typeof id !== "string" || !id) {
      throw createAppError("Case ID is required and must be a string", 400);
    }

    const tuitionCase = await caseService.findCaseById(id, req.user);

    return successResponse({
      res,
      data: tuitionCase,
      message: "Tuition case retrieved successfully",
      code: 200,
    });
  }

  async getCases(req: Request, res: Response) {
    if (!req.user) {
      throw createAppError("Unauthenticated", 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const serviceParams: {
      page: number;
      limit: number;
      search?: string;
      subject?: string;
      level?: string;
      status?: CaseStatus;
    } = {
      page,
      limit,
    };

    if (typeof req.query.search === "string" && req.query.search) {
      serviceParams.search = req.query.search;
    }
    if (typeof req.query.subject === "string" && req.query.subject) {
      serviceParams.subject = req.query.subject;
    }
    if (typeof req.query.level === "string" && req.query.level) {
      serviceParams.level = req.query.level;
    }
    if (typeof req.query.status === "string" && req.query.status) {
      const statusStr = req.query.status as CaseStatus;
      if (Object.values(CaseStatus).includes(statusStr)) {
        serviceParams.status = statusStr;
      }
    }

    const result = await caseService.findCases(req.user, serviceParams);

    return successResponse({
      res,
      data: result,
      message: "Tuition cases list retrieved successfully",
      code: 200,
    });
  }

  async inviteTutor(req: Request, res: Response) {
    if (!req.user) {
      throw createAppError("Unauthenticated", 401);
    }

    const id = req.params["id"];
    if (typeof id !== "string" || !id) {
      throw createAppError("Case ID is required and must be a string", 400);
    }

    const { tutorId } = req.body;
    if (typeof tutorId !== "string" || !tutorId) {
      throw createAppError("tutorId is required in request body and must be a string", 400);
    }

    const access = await caseService.inviteTutor(id, req.user.id, tutorId);

    return successResponse({
      res,
      data: access,
      message: "Tutor invited to case successfully",
      code: 200,
    });
  }

  async revokeTutor(req: Request, res: Response) {
    if (!req.user) {
      throw createAppError("Unauthenticated", 401);
    }

    const id = req.params["id"];
    const tutorId = req.params["tutorId"];
    if (typeof id !== "string" || typeof tutorId !== "string" || !id || !tutorId) {
      throw createAppError("Both Case ID and Tutor ID are required and must be strings", 400);
    }

    const result = await caseService.revokeTutor(id, req.user.id, tutorId);

    return successResponse({
      res,
      data: result,
      message: "Tutor access to case revoked successfully",
      code: 200,
    });
  }

  async uploadDocument(req: Request, res: Response) {
    if (!req.user) {
      throw createAppError("Unauthenticated", 401);
    }

    const id = req.params["id"];
    if (typeof id !== "string" || !id) {
      throw createAppError("Case ID is required and must be a string", 400);
    }

    const file = req.file;
    if (!file) {
      throw createAppError("No file uploaded or file was rejected by upload criteria", 400);
    }

    const document = await caseService.uploadDocument(id, req.user.id, req.user.role, file);

    return successResponse({
      res,
      data: document,
      message: "Case document uploaded successfully",
      code: 201,
    });
  }

  async downloadDocument(req: Request, res: Response) {
    if (!req.user) {
      throw createAppError("Unauthenticated", 401);
    }

    const id = req.params["id"];
    const docId = req.params["docId"];
    if (typeof id !== "string" || typeof docId !== "string" || !id || !docId) {
      throw createAppError("Both Case ID and Document ID are required and must be strings", 400);
    }

    const { document, filePath } = await caseService.downloadDocument(
      id,
      req.user.id,
      req.user.role,
      docId
    );

    res.setHeader("Content-Type", document.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${document.filename}"`);
    return res.sendFile(filePath);
  }
}

export const caseController = new CaseController();
