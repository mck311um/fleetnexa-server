import express from "express";
import cors from "cors";
import controller from "../controllers/util.controller";
import requireAuth from "../middleware/requireAuth";

const router = express.Router();

const allowedOrigins = ["http://localhost:5173"];

router.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);

router.use(requireAuth);

router.post(
  "/image-upload",
  controller.upload.single("file"),
  controller.uploadImage
);
router.post("/view", controller.viewFile);

export default router;
