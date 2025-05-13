import express from "express";
import controller from "../controllers/email.controller";
import cors from "cors";
import { allowedOrigins } from "../config/cors";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/send-documents", auth, controller.sendDocuments);

export default router;
