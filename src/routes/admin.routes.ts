import express from "express";
import cors from "cors";
import controller from "../controllers/admin.controller";
import { auth } from "../middleware/auth";
import { allowedOrigins } from "../config/cors";

const router = express.Router();

router.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);
router.get("/", controller.getData);

router.post("/vehicle-make", auth, controller.addVehicleMake);
router.post("/vehicle-model", auth, controller.addVehicleModel);
router.post("/vehicle-type", auth, controller.addVehicleType);

export default router;
