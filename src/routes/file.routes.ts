import express from "express";
import controller from "../controllers/file.controller";
import { auth } from "../middleware/auth";
import cors from "cors";

const router = express.Router();

const allowedOrigins = ["http://localhost:5173"];

router.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);

router.post("/upload", auth, controller.uploadFile);

router.get("/getUrl", auth, controller.getFileUrl);

router.delete("/:key", auth, controller.deleteFile);

export default router;
