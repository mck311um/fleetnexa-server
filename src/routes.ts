import { Application } from "express";

import bookingRoutes from "./modules/booking/booking.routes";

export const registerRoutes = (app: Application) => {
  app.use("/api/booking", bookingRoutes);
};
