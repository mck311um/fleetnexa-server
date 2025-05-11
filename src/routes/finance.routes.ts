import express from "express";
import cors from "cors";
import controller from "../controllers/finance.controller";
import { auth } from "../middleware/auth";
import { allowedOrigins } from "../config/cors";

const router = express.Router();

router.post("/booking/payment", auth, controller.addBookingPayment);

export default router;
