import express, { Application } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { allowedOrigins } from './config/cors';
import { registerRoutes } from './routes';
import cors from 'cors';

import tenantRoutes from './routes/tenant.routes';
import twillioRoutes from './routes/twillio.routes';

import './cron/maintenance.cron';
import './cron/stat.cron';
import './cron/notification.cron';
import sitemapRoutes from './routes/sitemap.routes';
import healthRoutes from './routes/health.routes';

dotenv.config();

const app: Application = express();

// Middlewares
app.use(helmet());
app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);

app.options('*', cors());

// Routes
registerRoutes(app);
app.use('/api/tenant', tenantRoutes);
app.use('/api/whatsapp', twillioRoutes);
app.use('/api/sitemap', sitemapRoutes);
app.use('/api/health', healthRoutes);

export default app;
