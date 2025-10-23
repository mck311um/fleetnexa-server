"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tenant_controller_1 = __importDefault(require("./tenant.controller"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/', auth_middleware_1.auth, tenant_controller_1.default.getCurrentTenant);
router.get('/:id', auth_middleware_1.auth, tenant_controller_1.default.getTenantById);
router.post('/', tenant_controller_1.default.createTenant);
router.put('/', auth_middleware_1.auth, tenant_controller_1.default.updateTenant);
router.patch('/storefront', auth_middleware_1.auth, tenant_controller_1.default.updateStorefrontSettings);
exports.default = router;
