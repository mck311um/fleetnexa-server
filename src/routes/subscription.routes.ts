import express from "express";
import controller from "../controllers/subscription.controller";

const router = express.Router();

router.post("/:planId/features", controller.addFeatures);
router.post("/features/bulk", controller.addFeaturesBulk);

export default router;
