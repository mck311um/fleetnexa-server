import express from "express";
import userController from "../controllers/user.controller";
import { auth } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", auth, userController.getTenantUsers);
router.get("/me", auth, userController.getCurrentUser);

router.post("/", auth, userController.createTenantUser);
router.post("/password", auth, userController.updatePassword);

router.patch("/", auth, userController.updateUser);

export default router;
