import express from "express";
import controller from "../controllers/booking.controller";
import { auth } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", auth, controller.getBookings);
router.get("/:id", auth, controller.getBookingById);

router.post("/", auth, controller.handleBooking);
router.post("/invoice/:bookingId", auth, controller.generateInvoice);
router.post("/agreement/:bookingId", auth, controller.generateBookingAgreement);
router.post("/decline", auth, controller.declineBooking);
router.post("/confirm", auth, controller.confirmBooking);
router.post("/decline", auth, controller.declineBooking);
router.post("/cancel", auth, controller.cancelBooking);
router.post("/start", auth, controller.startBooking);

export default router;
