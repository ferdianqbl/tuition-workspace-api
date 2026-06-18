import { Router } from "express";
import { caseController } from "./case.controller";
import { authenticate, requireRole } from "@/middlewares/auth.middleware";
import { Role } from "@/generated/prisma/client";
import { upload } from "@/middlewares/upload.middleware";

const router = Router();

// All case routes require authentication
router.use(authenticate);

// Get list of cases (filters, pagination) - Parent or Tutor can access
router.get("/", caseController.getCases);

// Create a new case (Parent only)
router.post("/", requireRole([Role.PARENT]), caseController.createCase);

// Get details of a specific case (Owner parent, invited tutor, or Admin)
router.get("/:id", caseController.getCaseById);

// Update a case (Owner parent or Admin)
router.patch("/:id", requireRole([Role.PARENT, Role.ADMIN]), caseController.updateCase);

// Invite a tutor to a case (Owner parent only)
router.post("/:id/access", requireRole([Role.PARENT]), caseController.inviteTutor);

// Revoke a tutor's access from a case (Owner parent only)
router.delete("/:id/access/:tutorId", requireRole([Role.PARENT]), caseController.revokeTutor);

// Upload a document to a case (Owner parent, invited tutor, or Admin)
router.post("/:id/documents", upload.single("file"), caseController.uploadDocument);

// Download a document from a case (Owner parent, invited tutor, or Admin)
router.get("/:id/documents/:docId/download", caseController.downloadDocument);

export default router;
