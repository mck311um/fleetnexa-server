import express from "express";
import cors from "cors";
import controller from "../controllers/booking.controller";
import { auth } from "../middleware/auth";
import { allowedOrigins } from "../config/cors";

const router = express.Router();

router.get("/", auth, controller.getBookings);

router.post("/", auth, controller.handleBooking);
router.post("/confirm", auth, controller.confirmBooking);

export default router;
