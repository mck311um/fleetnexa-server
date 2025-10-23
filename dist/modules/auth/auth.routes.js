"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("./auth.controller"));
const router = express_1.default.Router();
router.post('/tenant/login', auth_controller_1.default.tenantLogin);
router.post('/admin/login', auth_controller_1.default.adminUserLogin);
router.post('/admin/create', auth_controller_1.default.createAdminUser);
router.post('/storefront/create', auth_controller_1.default.createStorefrontUser);
router.post('/storefront/login', auth_controller_1.default.loginStorefrontUser);
exports.default = router;
