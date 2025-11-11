"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = require("./config/cors");
const routes_1 = require("./routes");
const cors_2 = __importDefault(require("cors"));
const tenant_routes_1 = __importDefault(require("./routes/tenant.routes"));
const file_routes_1 = __importDefault(require("./routes/file.routes"));
const customer_routes_1 = __importDefault(require("./routes/customer.routes"));
const twillio_routes_1 = __importDefault(require("./routes/twillio.routes"));
const rentnexa_routes_1 = __importDefault(require("./routes/rentnexa.routes"));
const zoho_routes_1 = __importDefault(require("./routes/zoho.routes"));
require("./cron/maintenance.cron");
require("./cron/stat.cron");
require("./cron/notification.cron");
const devvize_routes_1 = __importDefault(require("./routes/devvize.routes"));
const sitemap_routes_1 = __importDefault(require("./routes/sitemap.routes"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const subscription_routes_1 = __importDefault(require("./routes/subscription.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middlewares
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use((0, cors_2.default)({
    origin: (origin, callback) => {
        if (!origin || cors_1.allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.options('*', (0, cors_2.default)());
// Routes
(0, routes_1.registerRoutes)(app);
app.use('/api/tenant', tenant_routes_1.default);
app.use('/api/files', file_routes_1.default);
// app.use('/api/vehicle', vehicleRoutes);
app.use('/api/customer', customer_routes_1.default);
app.use('/api/whatsapp', twillio_routes_1.default);
app.use('/api/rentnexa', rentnexa_routes_1.default);
app.use('/api/zoho', zoho_routes_1.default);
app.use('/api/devvize', devvize_routes_1.default);
app.use('/api/sitemap', sitemap_routes_1.default);
app.use('/api/health', health_routes_1.default);
app.use('/api/subscription', subscription_routes_1.default);
exports.default = app;
