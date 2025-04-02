import express from "express";
import controller from "../controllers/customer.controller";
import { auth } from "../middleware/auth";
import cors from "cors";
import e from "express";

const router = express.Router();

const allowedOrigins = ["http://localhost:5173"];

router.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  })
);

router.post("/", auth, controller.upsertCustomer);

export default router;
