import express from "express";
import controller from "../controllers/tenant.controller";
import { auth } from "../middleware/auth";
import cors from "cors";
import { allowedOrigins } from "../config/cors";

const router = express.Router();

// router.use(
//   cors({
//     credentials: true,
//     origin: allowedOrigins,
//   })
// );

router.get("/locations", auth, controller.getTenantLocations);
router.get("/services", auth, controller.getTenantServices);
router.get("/:id", auth, controller.getTenantById);

router.post("/", controller.createTenant);
router.post("/setup", auth, controller.setupTenant);
router.post("/location", auth, controller.createTenantLocation);
router.post("/service", auth, controller.createTenantService);

router.put("/location", auth, controller.updateTenantLocation);
router.put("/service", auth, controller.updateTenantService);
router.put("/:id", auth, controller.updateTenant);

router.delete("/location/:id", auth, controller.deleteTenantLocation);
router.delete("/service/:id", auth, controller.deleteTenantService);

export default router;
