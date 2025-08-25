import express from "express";
import controller from "../controllers/email.controller";
import { auth } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/send-documents", auth, controller.sendDocuments);
router.post("/template", controller.setupTemplates);

router.put("/template", controller.updateEmailTemplate);

export default router;
