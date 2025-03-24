import express from "express";
import cors from "cors";
import controller from "../controllers/admin.controller";
import { auth } from "../middleware/auth";

const router = express.Router();

const allowedOrigins = ["http://localhost:5173"];
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
