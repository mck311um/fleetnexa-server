import express from "express";
import cors from "cors";
import controller from "../controllers/vehicle.controller";
import requireAuth from "../middleware/requireAuth";

const router = express.Router();

const allowedOrigins = ["http://localhost:5173"];
router.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);

router.use(requireAuth);

router.get("/vehicle-groups/:tenantId", controller.getVehicleGroups);

router.post("/vehicle-group", controller.upsertVehicleGroup);

router.delete("/vehicle-group/:groupId", controller.deleteVehicleGroup);

export default router;
