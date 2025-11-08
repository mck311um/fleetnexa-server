"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = __importDefault(require("./user.controller"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const admin_middleware_1 = require("../../middleware/admin.middleware");
const router = express_1.default.Router();
router.get('/', auth_middleware_1.auth, user_controller_1.default.getSystemUsers);
router.get('/me', auth_middleware_1.auth, user_controller_1.default.getCurrentUser);
router.get('/admin/me', admin_middleware_1.admin, user_controller_1.default.getCurrentAdminUser);
router.post('/', auth_middleware_1.auth, user_controller_1.default.createSystemUser);
router.post('/reset/:id', user_controller_1.default.resetUserPassword);
router.put('/', auth_middleware_1.auth, user_controller_1.default.updateSystemUser);
router.patch('/password', auth_middleware_1.auth, user_controller_1.default.changePassword);
router.delete('/:id', auth_middleware_1.auth, user_controller_1.default.deleteUser);
exports.default = router;
