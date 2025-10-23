"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vehicle_controller_1 = __importDefault(require("./vehicle.controller"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/', auth_middleware_1.auth, vehicle_controller_1.default.getAllTenantVehicles);
router.get('/plate/:plate', auth_middleware_1.auth, vehicle_controller_1.default.getVehicleByLicensePlate);
router.get('/:id', auth_middleware_1.auth, vehicle_controller_1.default.getVehicleById);
router.post('/', auth_middleware_1.auth, vehicle_controller_1.default.addVehicle);
router.put('/', auth_middleware_1.auth, vehicle_controller_1.default.updateVehicle);
router.patch('/status', auth_middleware_1.auth, vehicle_controller_1.default.updateVehicleStatus);
router.patch('/:id/storefront', auth_middleware_1.auth, vehicle_controller_1.default.updateVehicleStorefrontStatus);
router.delete('/:id', auth_middleware_1.auth, vehicle_controller_1.default.deleteVehicle);
exports.default = router;
