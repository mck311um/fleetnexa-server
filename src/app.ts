import express, { Application } from "express";
import dotenv from "dotenv";

import tenantRoutes from "./routes/tenant";
import userRoutes from "./routes/user";

dotenv.config();

const app: Application = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/tenant", tenantRoutes);
app.use("/api/user", userRoutes);

export default app;
