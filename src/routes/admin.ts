import express from "express";
import cors from "cors";
import controller from "../controllers/admin";
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

router.get("/", controller.getData);

router.post("/part", controller.addVehiclePart);

export default router;
