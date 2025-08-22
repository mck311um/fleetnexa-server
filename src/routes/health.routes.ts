import express from "express";
import controller from "../controllers/health.controller";

const router = express.Router();

router.head("", controller.healthCheck);
router.get("", controller.healthCheck);

export default router;
