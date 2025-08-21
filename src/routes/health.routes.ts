import express from "express";
import controller from "../controllers/health.controller";

const router = express.Router();

router.head("/health", controller.healthCheck);
router.get("/health", controller.healthCheck);

export default router;
