import { Router } from "express";
import { userController } from "./user.controller";

const router = Router();

router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.get("/:username", userController.getUserByUsername);

export default router;
