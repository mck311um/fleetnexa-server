import express from "express";
import cors from "cors";
import controller from "../controllers/vehicle.controller";
import { auth } from "../middleware/auth";
import e from "express";

const router = express.Router();

const allowedOrigins = ["http://localhost:5173"];
router.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);

router.post("/discount", auth, controller.addVehicleGroupDiscount);
router.post("/group", auth, controller.upsertVehicleGroup);

router.put("/discount", auth, controller.updateVehicleGroupDiscount);

router.delete("/discount/:id", auth, controller.deleteVehicleGroupDiscount);

export default router;
