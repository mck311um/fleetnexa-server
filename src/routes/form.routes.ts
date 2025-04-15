import express from "express";
import controller from "../controllers/form.controller";
import { auth } from "../middleware/auth";
import cors from "cors";
import { allowedOrigins } from "../config/cors";

const router = express.Router();

router.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);

router.post("/:type", auth, controller.dispatchForm);

export default router;
