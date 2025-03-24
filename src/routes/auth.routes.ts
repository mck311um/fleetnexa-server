import express from "express";
import controller from "../controllers/auth.controller";
import cors from "cors";

const router = express.Router();

const allowedOrigins = ["http://localhost:5173"];

router.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);

router.post("/register", controller.register);
router.post("/login", controller.login);

export default router;
