"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const storefront_controller_1 = __importDefault(require("./storefront.controller"));
const api_middleware_1 = require("../../middleware/api.middleware");
const router = express_1.default.Router();
router.get('/tenants', api_middleware_1.api, storefront_controller_1.default.getTenants);
router.get('/tenant/:slug', api_middleware_1.api, storefront_controller_1.default.getTenantBySlug);
router.get('/vehicles', api_middleware_1.api, storefront_controller_1.default.getVehicles);
router.get('/vehicle/:id', api_middleware_1.api, storefront_controller_1.default.getVehicleById);
router.post('/tenant/rate', api_middleware_1.api, storefront_controller_1.default.rateTenant);
exports.default = router;
