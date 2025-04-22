import express from "express";
import cors from "cors";
import controller from "../controllers/vehicle.controller";
import { auth } from "../middleware/auth";
import { allowedOrigins } from "../config/cors";

const router = express.Router();

router.get("/", auth, controller.getVehicles);
router.get("/groups", auth, controller.getVehicleGroups);
router.get("/damages/:id", auth, controller.getVehicleDamages);
router.get("/:id", auth, controller.getVehicleById);

router.post("/", auth, controller.addVehicle);
router.post("/discount", auth, controller.addVehicleGroupDiscount);
router.post("/group", auth, controller.upsertVehicleGroup);
router.post("/damage", auth, controller.addVehicleDamage);
router.post("/maintenance", auth, controller.addVehicleGroupMaintenance);

router.put("/vehicle", auth, controller.updateVehicle);
router.put("/discount", auth, controller.updateVehicleGroupDiscount);
router.put("/damage", auth, controller.updateVehicleDamage);

router.delete("/:id", auth, controller.deleteVehicleGroupDiscount);
router.delete("/:id", auth, controller.deleteVehicle);
router.delete("/damage/:id", auth, controller.deleteVehicleDamage);

export default router;
