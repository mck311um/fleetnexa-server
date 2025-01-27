import express from "express";
import cors from "cors";
import { createTenant, getTenantByCode } from "../controllers/tenant";

const router = express.Router();

const allowedOrigins = ["http://localhost:5173"];

router.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);

router.post("/create", async (req, res) => {
  const { tenantCode, name, email, number } = req.body;

  try {
    const newTenant = await createTenant(tenantCode, name, email, number);
    res.status(201).json(newTenant);
  } catch (error) {
    res.status(500).json({ error: "Failed to create tenant" });
  }
});

router.get("/:tenantCode", async (req, res) => {
  const { tenantCode } = req.params;

  try {
    const tenant = await getTenantByCode(tenantCode);
    if (tenant) {
      res.status(200).json(tenant);
    } else {
      res.status(404).json({ error: "Tenant not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tenant" });
  }
});

export default router;
