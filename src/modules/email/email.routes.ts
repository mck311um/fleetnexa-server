import express from "express";
import controller from "./email.controller";
import { auth } from "../../middleware/auth.middleware";
import { api } from "../../middleware/api.middleware";

const router = express.Router();

router.post("/template", controller.setupTemplates);

router.post("/booking/confirm/:id", auth, controller.sendConfirmationEmail);

export default router;
