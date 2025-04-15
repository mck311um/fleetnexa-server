import express from "express";
import controller from "../controllers/twillio.controller";
import { auth } from "../middleware/auth";
import cors from "cors";
import { allowedOrigins } from "../config/cors";

const router = express.Router();

// router.use(
//   cors({
//     credentials: true,
//     origin: allowedOrigins,
//   })
// );

router.post("/whatsapp/notification", controller.sendWhatsAppNotification);

export default router;
