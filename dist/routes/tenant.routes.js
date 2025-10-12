"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tenant_controller_1 = __importDefault(require("../controllers/tenant.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/reminders', auth_middleware_1.auth, tenant_controller_1.default.getTenantReminders);
router.get('/notifications', auth_middleware_1.auth, tenant_controller_1.default.getTenantNotifications);
router.post('/reminder', auth_middleware_1.auth, tenant_controller_1.default.addTenantReminder);
router.patch('/reminder/:id', auth_middleware_1.auth, tenant_controller_1.default.updateTenantReminder);
router.patch('/notifications/read', auth_middleware_1.auth, tenant_controller_1.default.markAllNotificationsAsRead);
router.patch('/notification/:id', auth_middleware_1.auth, tenant_controller_1.default.markNotificationAsRead);
router.delete('/role/:id', auth_middleware_1.auth, tenant_controller_1.default.markNotificationAsRead);
router.delete('/notification/:id', auth_middleware_1.auth, tenant_controller_1.default.deleteNotification);
exports.default = router;
