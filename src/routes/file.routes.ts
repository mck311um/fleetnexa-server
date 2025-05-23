import express from "express";
import controller from "../controllers/file.controller";
import { auth } from "../middleware/auth.middleware";
import cors from "cors";
import { allowedOrigins } from "../config/cors";

const router = express.Router();

router.post("/upload", auth, controller.uploadFile);

router.get("/getUrl", auth, controller.getFileUrl);

router.delete("/:key", auth, controller.deleteFile);

export default router;
