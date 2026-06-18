import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/user/user.routes";
import tutorRoutes from "../modules/tutor/tutor.routes";
import caseRoutes from "../modules/case/case.routes";
import swaggerRouter from "../config/swagger";

const router = Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/tutors", tutorRoutes);
router.use("/cases", caseRoutes);
router.use("/docs", swaggerRouter);

export default router;
