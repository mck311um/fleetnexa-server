import express from "express";
import controller from "../controllers/email.controller";
import { auth } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/send-documents", auth, controller.sendDocuments);

export default router;
