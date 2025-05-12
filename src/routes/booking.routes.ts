import express from "express";
import cors from "cors";
import controller from "../controllers/booking.controller";
import { auth } from "../middleware/auth";
import { allowedOrigins } from "../config/cors";

const router = express.Router();

router.get("/", auth, controller.getBookings);
router.get("/:id", auth, controller.getBookingById);

router.post("/", auth, controller.handleBooking);
router.post("/confirm", auth, controller.confirmBooking);
router.post("/decline", auth, controller.declineBooking);
router.post("/cancel", auth, controller.cancelBooking);
router.post("/start", auth, controller.startBooking);

export default router;
