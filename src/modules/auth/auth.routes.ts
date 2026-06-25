import { authenticate } from "../../middlewares/auth.middleware";
import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

router.use(authenticate);
router.post("/logout", authController.logout);
router.get("/me", authController.me);

export default router;
