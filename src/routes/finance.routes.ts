import express from "express";
import controller from "../controllers/finance.controller";
import { auth } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/transactions", auth, controller.getTransactions);

router.post("/rental/payment", auth, controller.addRentalPayment);
router.post("/rental/refund", auth, controller.addRefundPayment);

router.patch("/rental/refund", auth, controller.updateRefundPayment);
router.patch("/rental/payment", auth, controller.updateRentalPayment);

router.delete("/transaction/:id", auth, controller.removeTransaction);

export default router;
