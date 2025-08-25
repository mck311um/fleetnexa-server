import express from "express";
import controller from "../controllers/email.controller";
import { auth } from "../middleware/auth.middleware";
import { api } from "../middleware/api.middleware";

const router = express.Router();

router.post("/template", controller.setupTemplates);

router.post(
  "/booking/confirm/:bookingId",
  auth,
  controller.sendConfirmationEmail
);
router.post("/booking/complete", api, controller.sendCompletionEmail);

router.put("/template", controller.updateEmailTemplate);

export default router;
