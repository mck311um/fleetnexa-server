import express from "express";
import controller from "../controllers/health.controller";

const router = express.Router();

router.get("/health", controller.healthCheck);

export default router;
