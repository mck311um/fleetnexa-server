"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rentnexa_controller_1 = __importDefault(require("../controllers/rentnexa.controller"));
const api_middleware_1 = require("../middleware/api.middleware");
const router = express_1.default.Router();
router.get('/', api_middleware_1.api, rentnexa_controller_1.default.getFeaturedData);
router.get('/admin', api_middleware_1.api, rentnexa_controller_1.default.getAdminData);
router.get('/tenants', api_middleware_1.api, rentnexa_controller_1.default.getTenants);
router.get('/tenants/:slug', api_middleware_1.api, rentnexa_controller_1.default.getTenantBySlug);
router.get('/tenant/:id', api_middleware_1.api, rentnexa_controller_1.default.getTenantById);
router.get('/vehicles', api_middleware_1.api, rentnexa_controller_1.default.getVehicles);
router.get('/vehicle/:id', api_middleware_1.api, rentnexa_controller_1.default.getVehicleById);
exports.default = router;
