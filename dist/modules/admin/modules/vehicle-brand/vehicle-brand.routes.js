"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const vehicle_brand_controller_1 = __importDefault(require("./vehicle-brand.controller"));
const admin_middleware_1 = require("../../../../middleware/admin.middleware");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.get('/', admin_middleware_1.admin, vehicle_brand_controller_1.default.getVehicleBrands);
router.post('/', admin_middleware_1.admin, vehicle_brand_controller_1.default.createVehicleBrand);
router.put('/', admin_middleware_1.admin, vehicle_brand_controller_1.default.updateVehicleBrand);
router.delete('/:id', admin_middleware_1.admin, vehicle_brand_controller_1.default.deleteVehicleBrand);
router.post('/bulk', admin_middleware_1.admin, upload.single('file'), vehicle_brand_controller_1.default.bulkAddVehicleBrands);
exports.default = router;
