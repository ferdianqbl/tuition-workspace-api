import { authenticate } from "../../middlewares/auth.middleware";
import { Router } from "express";
import { userController } from "./user.controller";

const router = Router();

router.use(authenticate);

router.get("/", userController.getUsers);
router.post("/", userController.createUser);
router.get("/:id", userController.getUserById);
router.get("/:username", userController.getUserByUsername);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

export default router;
