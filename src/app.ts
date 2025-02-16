import express, { Application } from "express";
import dotenv from "dotenv";

import tenantRoutes from "./routes/tenant.route";
import userRoutes from "./routes/user.route";
import adminRoutes from "./routes/admin.route";
import utilRoutes from "./routes/util.route";

dotenv.config();

const app: Application = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/tenant", tenantRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/util", utilRoutes);

export default app;
