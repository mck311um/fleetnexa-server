import express, { Application } from "express";
import dotenv from "dotenv";
import helmet from "helmet";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import tenantRoutes from "./routes/tenant.routes";
import fileRoutes from "./routes/file.routes";
import adminRoutes from "./routes/admin.routes";
import vehicleRoutes from "./routes/vehicle.routes";
import customerRoutes from "./routes/customer.routes";
import emailRoutes from "./routes/email.routes";

dotenv.config();

const app: Application = express();

// Middlewares
app.use(helmet());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/tenant", tenantRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vehicle", vehicleRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/email", emailRoutes);

export default app;
