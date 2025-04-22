import express from "express";
import cors from "cors";
import controller from "../controllers/paddle.controller";
import { auth } from "../middleware/auth";
import { allowedOrigins } from "../config/cors";

const router = express.Router();

router.get("/customer/transactions", auth, controller.getCustomerSubscription);

router.post("/customer/:id", auth, controller.createPaddleCustomer);

router.post(
  "/webhook",
  cors({ credentials: false, origin: "*" }),
  controller.handleWebhook
);

export default router;
