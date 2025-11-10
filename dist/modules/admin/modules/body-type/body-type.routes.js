"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const body_type_controller_1 = __importDefault(require("./body-type.controller"));
const admin_middleware_1 = require("../../../../middleware/admin.middleware");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.get('/', admin_middleware_1.admin, body_type_controller_1.default.getVehicleBodyTypes);
router.post('/', admin_middleware_1.admin, body_type_controller_1.default.createVehicleBodyType);
router.put('/', admin_middleware_1.admin, body_type_controller_1.default.updateVehicleBodyType);
router.delete('/:id', admin_middleware_1.admin, body_type_controller_1.default.deleteVehicleBodyType);
router.post('/bulk', admin_middleware_1.admin, upload.single('file'), body_type_controller_1.default.bulkInsertVehicleBodyTypes);
exports.default = router;
