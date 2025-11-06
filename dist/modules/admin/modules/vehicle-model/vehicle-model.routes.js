"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const vehicle_model_controller_1 = __importDefault(require("./vehicle-model.controller"));
const admin_middleware_1 = require("../../../../middleware/admin.middleware");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.get('/', admin_middleware_1.admin, vehicle_model_controller_1.default.getVehicleModels);
router.post('/', admin_middleware_1.admin, vehicle_model_controller_1.default.createVehicleModel);
router.put('/', admin_middleware_1.admin, vehicle_model_controller_1.default.updateVehicleModel);
router.delete('/:id', admin_middleware_1.admin, vehicle_model_controller_1.default.deleteVehicleModel);
router.post('/bulk', admin_middleware_1.admin, upload.single('file'), vehicle_model_controller_1.default.bulkInsertVehicleModels);
exports.default = router;
