import express, { Application } from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import { allowedOrigins } from "./config/cors";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import tenantRoutes from "./routes/tenant.routes";
import fileRoutes from "./routes/file.routes";
import adminRoutes from "./routes/admin.routes";
import vehicleRoutes from "./routes/vehicle.routes";
import customerRoutes from "./routes/customer.routes";
import emailRoutes from "./routes/email.routes";
import twillioRoutes from "./routes/twillio.routes";
import financeRoutes from "./routes/finance.routes";
import rentalRoutes from "./routes/rental.routes";
import rentnexaRoutes from "./routes/rentnexa.routes";
import zohoRoutes from "./routes/zoho.routes";

import "./cron/maintenance.cron";
import "./cron/stat.cron";
import "./cron/exchangeRate.cron";
import "./cron/plans.cron";
import "./cron/country.cron";
import "./cron/notification.cron";
import errorHandler from "./middleware/error.middleware";
import devvizeRoutes from "./routes/devvize.routes";
import dodoRoutes from "./routes/dodo.routes";
import { bugsnagMiddleware } from "./config/bugsnag.config";

dotenv.config();

const app: Application = express();

// Middlewares
app.use(helmet());
app.use(express.json());

if (bugsnagMiddleware) {
  app.use(bugsnagMiddleware.requestHandler);
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.options("*", cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/tenant", tenantRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vehicle", vehicleRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/whatsapp", twillioRoutes);
app.use("/api/rental", rentalRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/rentnexa", rentnexaRoutes);
app.use("/api/zoho", zohoRoutes);
app.use("/api/devvize", devvizeRoutes);
app.use("/api/dodo", dodoRoutes);

if (bugsnagMiddleware) {
  app.use(bugsnagMiddleware.errorHandler);
}
app.use(errorHandler);

export default app;
