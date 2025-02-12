import express from "express";
import cors from "cors";
import controller from "../controllers/TenantController";

const router = express.Router();

const allowedOrigins = ["http://localhost:5173"];

router.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);

router.get("/:tenantCode", controller.getTenantData);

router.post("/create", controller.addTenant);
router.post("/service", controller.addService);
router.post("/setup", controller.setUpTenant);

export default router;
