import express from "express";
import controller from "../controllers/tenant.controller";
import { auth } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/locations", auth, controller.getTenantLocations);
router.get("/services", auth, controller.getServices);
router.get("/equipment", auth, controller.getEquipment);
router.get("/insurance", auth, controller.getInsurance);
router.get("/extras", auth, controller.getTenantExtras);
router.get("/activity", auth, controller.getTenantRentalActivity);
router.get("/:id", auth, controller.getTenantById);

router.post("/", controller.createTenant);
router.post("/setup", auth, controller.setupTenant);
router.post("/location", auth, controller.createTenantLocation);
router.post("/service", auth, controller.addService);
router.post("/equipment", auth, controller.addEquipment);
router.post("/insurance", auth, controller.addInsurance);

router.put("/location", auth, controller.updateTenantLocation);
router.put("/service", auth, controller.updateService);
router.put("/equipment", auth, controller.updateEquipment);
router.put("/insurance", auth, controller.updateInsurance);
router.put("/:id", auth, controller.updateTenant);

router.delete("/location/:id", auth, controller.deleteTenantLocation);
router.delete("/service/:id", auth, controller.deleteService);
router.delete("/equipment/:id", auth, controller.deleteEquipment);
router.delete("/insurance/:id", auth, controller.deleteInsurance);

export default router;
