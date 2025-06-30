import express from "express";
import controller from "../controllers/rental.controller";
import { auth } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", auth, controller.getRentals);
router.get("/:id", auth, controller.getRentalById);

router.post("/", auth, controller.handleRental);
router.post("/invoice/:rentalId", auth, controller.generateInvoice);
router.post("/agreement/:rentalId", auth, controller.generateRentalAgreement);
router.post("/decline", auth, controller.declineRental);
router.post("/confirm", auth, controller.confirmRental);
router.post("/decline", auth, controller.declineRental);
router.post("/cancel", auth, controller.cancelRental);
router.post("/start", auth, controller.startRental);
router.post("/end", auth, controller.endRental);

router.delete("/:id", auth, controller.deleteRental);

export default router;
