import express from "express";
import controller from "../controllers/finance.controller";
import { auth } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/rental/payment", auth, controller.addRentalPayment);

export default router;
