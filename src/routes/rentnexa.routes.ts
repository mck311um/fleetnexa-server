import express from "express";
import controller from "../controllers/rentnexa.controller";
import { api } from "../middleware/api.middleware";

const router = express.Router();

router.get("/", api, controller.getFeaturedData);
router.get("/admin", api, controller.getAdminData);
router.get("/vehicles", api, controller.getVehicles);

export default router;
