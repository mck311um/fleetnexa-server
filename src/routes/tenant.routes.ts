import express from "express";
import controller from "../controllers/tenant.controller";
import { auth } from "../middleware/auth";
import cors from "cors";

const router = express.Router();

const allowedOrigins = ["http://localhost:5173"];

router.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);

router.get("/locations", auth, controller.getTenantLocations);
router.get("/:id", auth, controller.getTenantById);

router.post("/", controller.createTenant);
router.post("/setup", auth, controller.setupTenant);

router.put("/:id", auth, controller.updateTenant);

export default router;
