import express from "express";
import controller from "../controllers/email.controller";
import { auth } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/send-documents", auth, controller.sendDocuments);
router.post("/template", controller.setupTemplates);

router.post(
  "/booking/confirm/:bookingId",
  auth,
  controller.sendConfirmationEmail
);

router.put("/template", controller.updateEmailTemplate);

export default router;
