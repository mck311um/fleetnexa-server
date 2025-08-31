import { Application } from "express";

import bookingRoutes from "./modules/booking/booking.routes";
import emailRoutes from "./modules/email/email.routes";

export const registerRoutes = (app: Application) => {
  app.use("/api/booking", bookingRoutes);
  app.use("/api/email", emailRoutes);
};
