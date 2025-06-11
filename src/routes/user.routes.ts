import express from "express";
import userController from "../controllers/user.controller";
import { auth } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", auth, userController.getTenantUsers);
router.get("/me", auth, userController.getCurrentUser);

export default router;
