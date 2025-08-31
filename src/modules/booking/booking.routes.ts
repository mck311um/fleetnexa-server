import express from "express";
import controller from "./booking.controller";
import { auth } from "../../middleware/auth.middleware";
import { api } from "../../middleware/api.middleware";

const router = express.Router();

router.get("/", auth, controller.getBookings);
router.get("/:id", auth, controller.getBookingById);

router.post("/", auth, controller.createSystemBooking);
router.post("/confirm", auth, controller.confirmRental);

router.put("/:id", auth, controller.updateBooking);

export default router;
