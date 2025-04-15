import express from "express";
import controller from "../controllers/email.controller";
import cors from "cors";
import { allowedOrigins } from "../config/cors";

const router = express.Router();

// router.use(
//   cors({
//     credentials: true,
//     origin: allowedOrigins,
//   })
// );

router.post("/contact", controller.sendContactEmail);

export default router;
