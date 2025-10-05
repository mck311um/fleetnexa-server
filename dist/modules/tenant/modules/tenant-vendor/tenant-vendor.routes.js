"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tenant_vendor_controller_1 = __importDefault(require("./tenant-vendor.controller"));
const auth_middleware_1 = require("../../../../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/', auth_middleware_1.auth, tenant_vendor_controller_1.default.getTenantVendors);
router.post('/', auth_middleware_1.auth, tenant_vendor_controller_1.default.addTenantVendor);
router.put('/', auth_middleware_1.auth, tenant_vendor_controller_1.default.updateTenantVendor);
router.delete('/:id', auth_middleware_1.auth, tenant_vendor_controller_1.default.deleteTenantVendor);
exports.default = router;
