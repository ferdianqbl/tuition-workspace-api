import { Role } from "../../generated/prisma/client";
import { authenticate, requireRole } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";
import { Router } from "express";
import { tutorController } from "./tutor.controller";

const router = Router();

router.use(authenticate);

// Directory search is restricted to Parents and Admins
router.get(
  "/",
  requireRole([Role.PARENT, Role.ADMIN]),
  tutorController.getProfiles,
);

// Fetch logged-in tutor's own profile
router.get("/me", requireRole([Role.TUTOR]), tutorController.getMyProfile);

// Fetch profile detail by profile ID (Service layer restricts tutor access)
router.get("/:id", tutorController.getProfileById);

// Create or update own profile
router.post("/", requireRole([Role.TUTOR]), tutorController.upsertProfile);

// Upload a document to own profile
router.post(
  "/documents",
  requireRole([Role.TUTOR]),
  upload.single("file"),
  tutorController.uploadDocument,
);

// Delete document from own profile
router.delete(
  "/documents/:docId",
  requireRole([Role.TUTOR]),
  tutorController.deleteDocument,
);

export default router;
