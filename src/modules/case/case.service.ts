import "multer";
import fs from "node:fs/promises";
import path from "node:path";
import { Role, CaseStatus } from "@prisma/client";
import { caseRepository } from "./case.repository";
import { userRepository } from "../user/user.repository";
import { createAppError } from "../../utils/error";
import { UPLOADS_DIR } from "../../lib/uploads";
import type {
  ICreateCaseRequest,
  IUpdateCaseRequest,
  ICaseFilters,
  ICaseQueryRequest,
} from "./case.types";

export class CaseService {
  async createCase(userId: string, data: ICreateCaseRequest) {
    return caseRepository.createCase({ userId, data });
  }

  async updateCase(
    id: string,
    userId: string,
    userRole: Role,
    data: IUpdateCaseRequest
  ) {
    const tuitionCase = await caseRepository.findCaseById(id);
    if (!tuitionCase) {
      throw createAppError("Tuition case not found", 404);
    }

    // Authorization: Only the parent who created the case (owner) or Admin can update it
    if (userRole !== Role.ADMIN && tuitionCase.userId !== userId) {
      throw createAppError("Access denied: You are not the owner of this case", 403);
    }

    // Clean data object to avoid exactOptionalPropertyTypes compilation errors
    const cleanedData: IUpdateCaseRequest = {};
    if (data.title !== undefined) cleanedData.title = data.title;
    if (data.subject !== undefined) cleanedData.subject = data.subject;
    if (data.level !== undefined) cleanedData.level = data.level;
    if (data.location !== undefined) cleanedData.location = data.location;
    if (data.budgetPerHour !== undefined) cleanedData.budgetPerHour = data.budgetPerHour;
    if (data.status !== undefined) cleanedData.status = data.status;

    return caseRepository.updateCase({ id, data: cleanedData });
  }

  async findCaseById(id: string, currentUser: { id: string; role: Role }) {
    const tuitionCase = await caseRepository.findCaseById(id);
    if (!tuitionCase) {
      throw createAppError("Tuition case not found", 404);
    }

    // Admin has access to everything
    if (currentUser.role === Role.ADMIN) {
      return tuitionCase;
    }

    // Parent must be the owner
    if (currentUser.role === Role.PARENT) {
      if (tuitionCase.userId !== currentUser.id) {
        throw createAppError("Access denied: You do not own this case", 403);
      }
      return tuitionCase;
    }

    // Tutor must have active invited access
    if (currentUser.role === Role.TUTOR) {
      const activeAccess = tuitionCase.caseAccesses.find(
        (access) => access.tutorId === currentUser.id
      );
      if (!activeAccess) {
        throw createAppError("Access denied: You have not been invited to this case", 403);
      }
      return tuitionCase;
    }

    throw createAppError("Access denied: Invalid user role", 403);
  }

  async findCases(
    currentUser: { id: string; role: Role },
    params: {
      search?: string;
      subject?: string;
      level?: string;
      status?: CaseStatus;
      page: number;
      limit: number;
    }
  ) {
    const { search, subject, level, status, page, limit } = params;
    const skip = (page - 1) * limit;
    const take = limit;

    // Build filters object securely (obeying exactOptionalPropertyTypes)
    const filters: ICaseFilters = {};
    if (search) filters.search = search;
    if (subject) filters.subject = subject;
    if (level) filters.level = level;
    if (status) filters.status = status;

    const queryParams: ICaseQueryRequest = {
      skip,
      take,
    };
    if (Object.keys(filters).length > 0) {
      queryParams.filters = filters;
    }

    if (currentUser.role === Role.PARENT) {
      const countParams: { parentId: string; filters?: ICaseFilters } = {
        parentId: currentUser.id,
      };
      if (Object.keys(filters).length > 0) {
        countParams.filters = filters;
      }

      const [data, total] = await Promise.all([
        caseRepository.findCasesForParent({
          parentId: currentUser.id,
          params: queryParams,
        }),
        caseRepository.countCasesForParent(countParams),
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    if (currentUser.role === Role.TUTOR) {
      const countParams: { tutorId: string; filters?: ICaseFilters } = {
        tutorId: currentUser.id,
      };
      if (Object.keys(filters).length > 0) {
        countParams.filters = filters;
      }

      const [data, total] = await Promise.all([
        caseRepository.findCasesForTutor({
          tutorId: currentUser.id,
          params: queryParams,
        }),
        caseRepository.countCasesForTutor(countParams),
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    throw createAppError("Access denied: Invalid user role to view cases list", 403);
  }

  async inviteTutor(caseId: string, parentId: string, tutorId: string) {
    const tuitionCase = await caseRepository.findCaseById(caseId);
    if (!tuitionCase) {
      throw createAppError("Tuition case not found", 404);
    }

    // Verify ownership
    if (tuitionCase.userId !== parentId) {
      throw createAppError("Access denied: You are not the owner of this case", 403);
    }

    // Verify tutor exists and is actually a TUTOR
    const tutor = await userRepository.findById(tutorId);
    if (!tutor || tutor.role !== Role.TUTOR) {
      throw createAppError("Tutor not found or invalid user role", 404);
    }

    return caseRepository.createAccess({
      caseId,
      parentId,
      tutorId,
    });
  }

  async revokeTutor(caseId: string, parentId: string, tutorId: string) {
    const tuitionCase = await caseRepository.findCaseById(caseId);
    if (!tuitionCase) {
      throw createAppError("Tuition case not found", 404);
    }

    // Verify ownership
    if (tuitionCase.userId !== parentId) {
      throw createAppError("Access denied: You are not the owner of this case", 403);
    }

    const access = await caseRepository.findAccess(caseId, tutorId);
    if (!access) {
      throw createAppError("No active invitation/access found for this tutor on this case", 404);
    }

    await caseRepository.revokeAccess({ caseId, tutorId });
    return { success: true };
  }

  async uploadDocument(
    caseId: string,
    userId: string,
    userRole: Role,
    file: Express.Multer.File
  ) {
    const tuitionCase = await caseRepository.findCaseById(caseId);
    if (!tuitionCase) {
      await fs.unlink(file.path).catch(() => null);
      throw createAppError("Tuition case not found", 404);
    }

    let isAuthorized = false;

    if (userRole === Role.ADMIN) {
      isAuthorized = true;
    } else if (userRole === Role.PARENT) {
      isAuthorized = tuitionCase.userId === userId;
    } else if (userRole === Role.TUTOR) {
      const activeAccess = tuitionCase.caseAccesses.some(
        (access) => access.tutorId === userId
      );
      isAuthorized = activeAccess;
    }

    if (!isAuthorized) {
      await fs.unlink(file.path).catch(() => null);
      throw createAppError("Access denied: You are not authorized to upload documents to this case", 403);
    }

    return caseRepository.createDocument({
      caseId,
      data: {
        filename: file.filename,
        size: file.size,
        mimeType: file.mimetype,
      },
    });
  }

  async downloadDocument(
    caseId: string,
    userId: string,
    userRole: Role,
    docId: string
  ) {
    const document = await caseRepository.findDocumentById(docId);
    if (!document) {
      throw createAppError("Document not found", 404);
    }

    if (document.caseId !== caseId) {
      throw createAppError("Document does not belong to this case", 400);
    }

    let isAuthorized = false;

    if (userRole === Role.ADMIN) {
      isAuthorized = true;
    } else if (userRole === Role.PARENT) {
      isAuthorized = document.case.userId === userId;
    } else if (userRole === Role.TUTOR) {
      const access = await caseRepository.findAccess(caseId, userId);
      isAuthorized = !!access;
    }

    if (!isAuthorized) {
      throw createAppError("Access denied: You are not authorized to download this document", 403);
    }

    const filePath = path.join(UPLOADS_DIR, document.filename);
    
    // Check if the physical file exists on disk
    try {
      await fs.access(filePath);
    } catch {
      throw createAppError("Document file is missing from disk storage", 404);
    }

    return {
      document,
      filePath,
    };
  }
}

export const caseService = new CaseService();
