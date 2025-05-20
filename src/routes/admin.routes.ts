import express from "express";
import controller from "../controllers/admin.controller";
import { auth } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", controller.getData);

router.post("/vehicle-make", auth, controller.addVehicleMake);
router.post("/vehicle-model", auth, controller.addVehicleModel);
router.post("/vehicle-type", auth, controller.addVehicleType);
router.post("/vehicle-feature", auth, controller.addVehicleFeature);

export default router;
