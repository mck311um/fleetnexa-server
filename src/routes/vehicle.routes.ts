import express from "express";
import controller from "../controllers/vehicle.controller";
import { auth } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", auth, controller.getVehicles);
router.get("/groups", auth, controller.getVehicleGroups);
router.get("/groups/:id/vehicles", auth, controller.getVehiclesByGroup);
router.get("/groups/:id", auth, controller.getVehicleGroupById);
router.get("/damages/:id", auth, controller.getVehicleDamages);
router.get("/:id", auth, controller.getVehicleById);

router.post("/", auth, controller.addVehicle);
router.post("/discount", auth, controller.addVehicleGroupDiscount);
router.post("/group", auth, controller.addVehicleGroup);
router.post("/damage", auth, controller.addVehicleDamage);

router.put("/", auth, controller.updateVehicle);
router.put("/discount", auth, controller.updateVehicleGroupDiscount);
router.put("/damage", auth, controller.updateVehicleDamage);
router.put("/group", auth, controller.updateVehicleGroup);

router.delete("/group/:id", auth, controller.deleteVehicleGroup);
router.delete("/damage/:id", auth, controller.deleteVehicleDamage);
router.delete("/:id", auth, controller.deleteVehicle);

export default router;
