"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tenant_notification_controller_1 = __importDefault(require("./tenant-notification.controller"));
const auth_middleware_1 = require("../../../../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/', auth_middleware_1.auth, tenant_notification_controller_1.default.getNotifications);
router.post('/', auth_middleware_1.auth, tenant_notification_controller_1.default.markAllNotificationsAsRead);
router.post('/:id', auth_middleware_1.auth, tenant_notification_controller_1.default.markNotificationAsRead);
router.delete('/:id', auth_middleware_1.auth, tenant_notification_controller_1.default.deleteNotification);
exports.default = router;
