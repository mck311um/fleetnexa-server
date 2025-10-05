"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vehicle_maintenance_controller_1 = __importDefault(require("./vehicle-maintenance.controller"));
const auth_middleware_1 = require("../../../../middleware/auth.middleware");
const router = express_1.default.Router();
router.get('/', auth_middleware_1.auth, vehicle_maintenance_controller_1.default.getScheduledMaintenances);
router.get('/:id', auth_middleware_1.auth, vehicle_maintenance_controller_1.default.getVehicleMaintenances);
router.post('/', auth_middleware_1.auth, vehicle_maintenance_controller_1.default.addVehicleMaintenance);
router.post('/complete', auth_middleware_1.auth, vehicle_maintenance_controller_1.default.completeVehicleMaintenance);
router.put('/', auth_middleware_1.auth, vehicle_maintenance_controller_1.default.updateVehicleMaintenance);
router.delete('/:vehicleId/:maintenanceId', auth_middleware_1.auth, vehicle_maintenance_controller_1.default.deleteVehicleMaintenance);
exports.default = router;
