import express from "express";
import cors from "cors";
import controller from "../controllers/vehicle.controller";
import { auth } from "../middleware/auth";
import { allowedOrigins } from "../config/cors";

const router = express.Router();

router.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);

router.get("/groups", auth, controller.getVehicleGroups);
router.get("/vehicles", auth, controller.getVehicles);

router.post("/vehicle", auth, controller.addVehicle);
router.post("/discount", auth, controller.addVehicleGroupDiscount);
router.post("/group", auth, controller.upsertVehicleGroup);
router.post("/maintenance", auth, controller.addVehicleGroupMaintenance);

router.put("/vehicle", auth, controller.updateVehicle);
router.put("/discount", auth, controller.updateVehicleGroupDiscount);

router.delete("/discount/:id", auth, controller.deleteVehicleGroupDiscount);
router.delete("/vehicle/:id", auth, controller.deleteVehicle);

export default router;
