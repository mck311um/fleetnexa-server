import express from "express";
import controller from "../controllers/rentnexa.controller";
import { api } from "../middleware/api.middleware";

const router = express.Router();

router.get("/", api, controller.getFeaturedData);
router.get("/admin", api, controller.getAdminData);
router.get("/tenants", api, controller.getTenants);
router.get("/tenants/:slug", api, controller.getTenantBySlug);
router.get("/tenant/:id", api, controller.getTenantById);
router.get("/vehicles", api, controller.getVehicles);
router.get("/vehicle/:id", api, controller.getVehicleById);

export default router;
