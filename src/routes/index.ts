import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/user/user.routes";

const router = Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);

export default router;
