import express from "express";
import controller from "../controllers/twillio.controller";

const router = express.Router();

router.post("/whatsapp/notification", controller.sendWhatsAppNotification);

export default router;
