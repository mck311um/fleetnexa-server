import express from "express";
import userController from "../controllers/user.controller";
import { auth } from "../middleware/auth";
import cors from "cors";

const router = express.Router();

const allowedOrigins = ["http://localhost:5173"];

router.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);

router.get("/me", auth, userController.getCurrentUser);

export default router;
